import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function buildEmailConfirmationHtml(params: {
  confirmLink: string;
  userEmail: string;
  firstName?: string;
}): string {
  const { confirmLink, userEmail, firstName } = params;
  const displayName = firstName ? firstName : 'vous';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmez votre adresse email – Donnali</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f7fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f7fb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <tr>
            <td style="background:linear-gradient(135deg,#0077B6 0%,#005a8f 100%);border-radius:16px 16px 0 0;padding:36px 40px 32px;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="background-color:rgba(255,255,255,0.15);border-radius:12px;padding:10px 18px;">
                    <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:1.5px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9992; DONNALI</span>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto 12px;">
                <tr>
                  <td style="background-color:rgba(255,255,255,0.15);border-radius:50%;width:64px;height:64px;text-align:center;vertical-align:middle;">
                    <span style="font-size:28px;line-height:64px;display:block;">&#9993;</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                Bienvenue sur Donnali&nbsp;!
              </h1>
              <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.6;">
                Plus qu'une étape pour activer votre compte
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">

              <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
                Merci d'avoir rejoint <strong style="color:#0077B6;">Donnali</strong>, la plateforme qui connecte voyageurs et expéditeurs entre La Réunion, Mayotte et la France métropolitaine.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#e6f3fb 0%,#cce7f7 100%);border-radius:14px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Ce que vous pouvez faire sur Donnali</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid rgba(0,119,182,0.15);">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:28px;vertical-align:top;padding-top:2px;">
                                <span style="font-size:16px;">&#9992;</span>
                              </td>
                              <td style="padding-left:8px;">
                                <p style="margin:0;font-size:14px;color:#1e293b;font-weight:600;">Poster une annonce de voyage</p>
                                <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Indiquez votre vol et votre capacité disponible</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid rgba(0,119,182,0.15);">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:28px;vertical-align:top;padding-top:2px;">
                                <span style="font-size:16px;">&#128230;</span>
                              </td>
                              <td style="padding-left:8px;">
                                <p style="margin:0;font-size:14px;color:#1e293b;font-weight:600;">Trouver un voyageur de confiance</p>
                                <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Envoyez vos colis en toute sérénité</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:28px;vertical-align:top;padding-top:2px;">
                                <span style="font-size:16px;">&#128274;</span>
                              </td>
                              <td style="padding-left:8px;">
                                <p style="margin:0;font-size:14px;color:#1e293b;font-weight:600;">Transactions sécurisées</p>
                                <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Coordonnées protégées, paiement sécurisé</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Pour activer votre compte et commencer à utiliser Donnali, confirmez votre adresse email en cliquant sur le bouton ci-dessous :
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${confirmLink}" style="display:inline-block;background:linear-gradient(135deg,#0077B6,#005a8f);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 44px;border-radius:12px;letter-spacing:0.5px;">
                      Confirmer mon adresse email
                    </a>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#edf7f1;border-radius:12px;border-left:4px solid #52B788;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:14px;color:#266d4c;line-height:1.6;">
                      <strong>Lien valide 24h.</strong> Si vous n'avez pas créé de compte sur Donnali, ignorez simplement cet email.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:12px;color:#64748b;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
                    <p style="margin:0;font-size:12px;color:#0077B6;word-break:break-all;">${confirmLink}</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="background-color:#f8fafc;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#0077B6;letter-spacing:1px;">DONNALI</p>
              <p style="margin:0 0 10px;font-size:12px;color:#94a3b8;line-height:1.6;">
                La plateforme de mise en relation entre voyageurs et expéditeurs.<br/>
                La Réunion &bull; Mayotte &bull; Paris
              </p>
              <p style="margin:0;font-size:11px;color:#cbd5e1;">
                Vous recevez cet email car vous venez de créer un compte sur Donnali.<br/>
                &copy; 2026 Donnali &mdash; Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildPasswordResetEmail(params: {
  resetLink: string;
  userEmail: string;
}): string {
  const { resetLink, userEmail } = params;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réinitialisation de mot de passe – Donnali</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f7fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f7fb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <tr>
            <td style="background:linear-gradient(135deg,#005a8f 0%,#004c7a 100%);border-radius:16px 16px 0 0;padding:36px 40px 32px;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="background-color:rgba(255,255,255,0.15);border-radius:12px;padding:10px 18px;">
                    <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:1.5px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9992; DONNALI</span>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto 12px;">
                <tr>
                  <td style="background-color:rgba(255,255,255,0.15);border-radius:50%;width:64px;height:64px;text-align:center;vertical-align:middle;">
                    <span style="font-size:28px;line-height:64px;display:block;">&#128274;</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">
                Réinitialisation du mot de passe
              </h1>
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);line-height:1.6;">
                Une demande de réinitialisation a été effectuée pour votre compte
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">

              <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
                Nous avons reçu une demande de réinitialisation du mot de passe associé à l'adresse <strong style="color:#0077B6;">${userEmail}</strong>.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff7ed;border-radius:12px;border-left:4px solid #f97316;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:14px;color:#9a3412;line-height:1.6;">
                      <strong>Si vous n'êtes pas à l'origine de cette demande</strong>, ignorez cet email. Votre mot de passe restera inchangé et votre compte est en sécurité.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#e6f3fb,#cce7f7);border-radius:14px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Détails de la demande</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid rgba(0,119,182,0.15);">
                          <span style="font-size:13px;color:#64748b;">Compte concerné</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid rgba(0,119,182,0.15);text-align:right;">
                          <span style="font-size:13px;font-weight:600;color:#1e293b;">${userEmail}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:13px;color:#64748b;">Lien valide pendant</span>
                        </td>
                        <td style="padding:8px 0;text-align:right;">
                          <span style="font-size:13px;font-weight:600;color:#1e293b;">1 heure</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe sécurisé :
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#0077B6,#005a8f);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 44px;border-radius:12px;letter-spacing:0.5px;">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:12px;color:#64748b;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
                    <p style="margin:0;font-size:12px;color:#0077B6;word-break:break-all;">${resetLink}</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="background-color:#f8fafc;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#0077B6;letter-spacing:1px;">DONNALI</p>
              <p style="margin:0 0 10px;font-size:12px;color:#94a3b8;line-height:1.6;">
                La plateforme de mise en relation entre voyageurs et expéditeurs.<br/>
                La Réunion &bull; Mayotte &bull; Paris
              </p>
              <p style="margin:0;font-size:11px;color:#cbd5e1;">
                Vous recevez cet email car vous avez un compte sur Donnali.<br/>
                &copy; 2026 Donnali &mdash; Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!RESEND_API_KEY) {
      console.info('[send-auth-email] RESEND_API_KEY not configured — skipping');
      return new Response(
        JSON.stringify({ success: true, skipped: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body = await req.json();
    const { user, email_data } = body;

    const userEmail: string = user?.email ?? '';
    const emailType: string = email_data?.email_action_type ?? '';
    const token: string = email_data?.token ?? '';
    const tokenHash: string = email_data?.token_hash ?? '';
    const redirectTo: string = email_data?.redirect_to ?? 'https://donnali.re';
    const siteUrl: string = Deno.env.get('SUPABASE_URL') ?? 'https://donnali.re';

    let subject = '';
    let html = '';

    if (emailType === 'signup' || emailType === 'email_change') {
      const confirmLink = `${siteUrl}/auth/v1/verify?token=${tokenHash}&type=${emailType === 'signup' ? 'signup' : 'email_change'}&redirect_to=${encodeURIComponent(redirectTo)}`;
      subject = 'Confirmez votre adresse email – Donnali';
      html = buildEmailConfirmationHtml({
        confirmLink,
        userEmail,
        firstName: user?.user_metadata?.full_name?.split(' ')[0],
      });
    } else if (emailType === 'recovery') {
      const resetLink = `${siteUrl}/auth/v1/verify?token=${tokenHash}&type=recovery&redirect_to=${encodeURIComponent(redirectTo)}`;
      subject = 'Réinitialisation de votre mot de passe – Donnali';
      html = buildPasswordResetEmail({ resetLink, userEmail });
    } else if (emailType === 'magiclink') {
      const magicLink = `${siteUrl}/auth/v1/verify?token=${tokenHash}&type=magiclink&redirect_to=${encodeURIComponent(redirectTo)}`;
      subject = 'Votre lien de connexion – Donnali';
      html = buildEmailConfirmationHtml({
        confirmLink: magicLink,
        userEmail,
      });
    } else {
      console.info('[send-auth-email] Unknown email type:', emailType, '— skipping');
      return new Response(
        JSON.stringify({ success: true, skipped: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Donnali <noreply@donnali.re>',
        to: [userEmail],
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('[send-auth-email] Resend error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.info('[send-auth-email] Email sent:', emailType, 'to', userEmail);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error: any) {
    console.error('[send-auth-email] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
