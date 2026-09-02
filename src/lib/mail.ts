import { token, appBaseUrl } from './utils';
import { prisma } from './prisma';

const FROM = process.env.RESEND_FROM || 'EasyAsso <onboarding@resend.dev>';

export function appUrl() {
  return appBaseUrl();
}

export async function sendMail(input: { to: string; subject: string; html: string; text?: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`Email not sent: missing RESEND_API_KEY. Subject: ${input.subject}; To: ${input.to}`);
    return { skipped: true };
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('Unable to send email', data);
    throw new Error(data?.message || 'Envoi email impossible');
  }
  return data;
}

export async function createOneTimeToken(identifier: string, minutes = 60) {
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  const value = token();
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: value,
      expires: new Date(Date.now() + minutes * 60 * 1000),
    },
  });
  return value;
}

export async function sendVerificationEmail(email: string, language: 'fr' | 'en' = 'fr') {
  const value = await createOneTimeToken(`verify-email:${email}`, 24 * 60);
  const url = `${appUrl()}/verify-email?token=${encodeURIComponent(value)}`;
  const en = language === 'en';
  return sendMail({
    to: email,
    subject: en ? 'Confirm your EasyAsso email' : 'Confirmez votre email EasyAsso',
    text: en ? `Confirm your email: ${url}` : `Confirmez votre email : ${url}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827"><h1>${en ? 'Confirm your email' : 'Confirmez votre email'}</h1><p>${en ? 'Click the button below to secure your EasyAsso account.' : 'Cliquez sur le bouton ci-dessous pour sécuriser votre compte EasyAsso.'}</p><p><a href="${url}" style="display:inline-block;background:#4f5cf6;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">${en ? 'Confirm my email' : 'Confirmer mon email'}</a></p><p style="color:#6b7280;font-size:13px">${url}</p></div>`,
  });
}

export async function sendPasswordResetEmail(email: string, language: 'fr' | 'en' = 'fr') {
  const value = await createOneTimeToken(`reset-password:${email}`, 60);
  const url = `${appUrl()}/reset-password?token=${encodeURIComponent(value)}`;
  const en = language === 'en';
  return sendMail({
    to: email,
    subject: en ? 'Reset your EasyAsso password' : 'Réinitialisez votre mot de passe EasyAsso',
    text: en ? `Reset your password: ${url}` : `Réinitialisez votre mot de passe : ${url}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827"><h1>${en ? 'Reset your password' : 'Réinitialisez votre mot de passe'}</h1><p>${en ? 'This link is valid for one hour.' : 'Ce lien est valable pendant une heure.'}</p><p><a href="${url}" style="display:inline-block;background:#4f5cf6;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">${en ? 'Choose a new password' : 'Choisir un nouveau mot de passe'}</a></p><p style="color:#6b7280;font-size:13px">${url}</p></div>`,
  });
}

export async function sendTeamInvitationEmail(input: { email: string; token: string; organizationName: string; roleName: string }) {
  const url = input.token ? `${appUrl()}/accept-invitation?token=${encodeURIComponent(input.token)}` : `${appUrl()}/login`;
  const safeOrg = input.organizationName.replace(/[<>&"]/g, '');
  const safeRole = input.roleName.replace(/[<>&"]/g, '');
  return sendMail({
    to: input.email,
    subject: `Invitation à rejoindre ${safeOrg}`,
    text: `Vous êtes invité(e) à rejoindre ${safeOrg} avec le rôle ${safeRole}. ${input.token ? 'Accepter l’invitation' : 'Se connecter'} : ${url}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#07101f;max-width:600px;margin:auto"><div style="background:#050811;color:#fff;padding:26px;border-radius:18px"><p style="color:#6ea0ff;font-weight:800;letter-spacing:.12em">INVITATION ÉQUIPE</p><h1 style="margin:8px 0">Rejoignez ${safeOrg}</h1><p>Vous avez été invité(e) avec le rôle <strong>${safeRole}</strong>.</p><p style="margin-top:24px"><a href="${url}" style="display:inline-block;background:#2f6bff;color:white;padding:13px 20px;border-radius:10px;text-decoration:none;font-weight:800">${input.token ? 'Accepter l’invitation' : 'Ouvrir mon espace'}</a></p><p style="color:#aebbd1;font-size:12px;margin-top:22px">Lien sécurisé : ${url}</p></div></div>`,
  });
}
