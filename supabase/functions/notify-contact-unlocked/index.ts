import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const CITY_LABELS: Record<string, string> = {
  reunion: 'La Réunion',
  mayotte: 'Mayotte',
  paris: 'Paris',
};

function buildContactUnlockedEmail(params: {
  departureLabel: string;
  destinationLabel: string;
  flightDate: string;
  buyerEmail: string;
  ownerName: string;
}): string {
  const { departureLabel, destinationLabel, flightDate, buyerEmail, ownerName } = params;
  const firstName = ownerName?.split(' ')[0] ?? 'Voyageur';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quelqu'un a débloqué vos coordonnées – Donnali</title>
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
              <h1 style="margin:24px 0 8px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                Bonne nouvelle, ${firstName}&nbsp;!
              </h1>
              <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.6;">
                Quelqu'un vient de débloquer vos coordonnées sur Donnali
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">

              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Votre annonce a retenu l'attention d'un expéditeur. Il a accédé à vos coordonnées et souhaite probablement vous contacter pour organiser le transfert de ses bagages.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#e6f3fb 0%,#cce7f7 100%);border-radius:14px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Votre annonce</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="text-align:center;width:40%;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#004c7a;">${departureLabel}</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Départ</p>
                        </td>
                        <td style="text-align:center;width:20%;font-size:22px;color:#0077B6;">&#8594;</td>
                        <td style="text-align:center;width:40%;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#004c7a;">${destinationLabel}</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Arrivée</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;border-top:1px solid #99cfef;">
                      <tr>
                        <td style="padding-top:14px;text-align:center;font-size:14px;color:#005a8f;">
                          Vol le <strong>${flightDate}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Contact de l'expéditeur</p>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#0077B6;border-radius:50%;width:40px;height:40px;text-align:center;vertical-align:middle;">
                          <span style="color:#ffffff;font-size:18px;font-weight:700;line-height:40px;display:block;">@</span>
                        </td>
                        <td style="padding-left:14px;">
                          <p style="margin:0;font-size:15px;font-weight:700;color:#1e293b;">${buyerEmail}</p>
                          <p style="margin:2px 0 0;font-size:12px;color:#94a3b8;">Expéditeur intéressé par votre annonce</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#edf7f1;border-radius:12px;border-left:4px solid #52B788;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:14px;color:#266d4c;line-height:1.6;">
                      <strong>Conseil :</strong> Vérifiez si l'expéditeur vous a déjà envoyé un message. N'hésitez pas à le contacter directement pour finaliser l'organisation.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="https://donnali.re" style="display:inline-block;background:linear-gradient(135deg,#0077B6,#005a8f);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:15px 40px;border-radius:12px;letter-spacing:0.5px;">
                      Voir mon tableau de bord
                    </a>
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

function buildTransactionValidatedTravelerEmail(params: {
  departureLabel: string;
  destinationLabel: string;
  flightDate: string;
  codeUsed: string;
  validatedAt: string;
  travelerName: string;
  senderEmail: string;
}): string {
  const { departureLabel, destinationLabel, flightDate, codeUsed, validatedAt, travelerName, senderEmail } = params;
  const firstName = travelerName?.split(' ')[0] ?? 'Voyageur';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Remise confirmée – Donnali</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f7fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f7fb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <tr>
            <td style="background:linear-gradient(135deg,#1a7a4a 0%,#0f5c34 100%);border-radius:16px 16px 0 0;padding:36px 40px 32px;text-align:center;">
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
                    <span style="font-size:28px;line-height:64px;display:block;">&#10003;</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                Remise confirmée, ${firstName}&nbsp;!
              </h1>
              <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.6;">
                L'échange de bagages a été validé avec succès
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">

              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Vous venez de confirmer la réception des bagages sur votre vol. L'échange est maintenant archivé et constitue une preuve officielle de la remise.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#e6f3fb 0%,#cce7f7 100%);border-radius:14px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Trajet concerné</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="text-align:center;width:40%;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#004c7a;">${departureLabel}</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Départ</p>
                        </td>
                        <td style="text-align:center;width:20%;font-size:22px;color:#0077B6;">&#8594;</td>
                        <td style="text-align:center;width:40%;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#004c7a;">${destinationLabel}</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Arrivée</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;border-top:1px solid #99cfef;">
                      <tr>
                        <td style="padding-top:14px;text-align:center;font-size:14px;color:#005a8f;">
                          Vol le <strong>${flightDate}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0faf5;border-radius:12px;border:1px solid #a7f3d0;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:1px;">Détails de la validation</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid rgba(6,95,70,0.1);">
                          <span style="font-size:13px;color:#374151;">Code utilisé</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid rgba(6,95,70,0.1);text-align:right;">
                          <span style="font-size:14px;font-weight:800;color:#065f46;font-family:monospace;letter-spacing:2px;">${codeUsed}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid rgba(6,95,70,0.1);">
                          <span style="font-size:13px;color:#374151;">Validé le</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid rgba(6,95,70,0.1);text-align:right;">
                          <span style="font-size:13px;font-weight:600;color:#1e293b;">${validatedAt}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:13px;color:#374151;">Contact expéditeur</span>
                        </td>
                        <td style="padding:8px 0;text-align:right;">
                          <span style="font-size:13px;font-weight:600;color:#0077B6;">${senderEmail}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#edf7f1;border-radius:12px;border-left:4px solid #52B788;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:14px;color:#266d4c;line-height:1.6;">
                      <strong>Archivé en toute securite :</strong> cet échange est conservé dans votre historique Donnali. Vous pouvez le consulter à tout moment depuis votre tableau de bord.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="https://donnali.re" style="display:inline-block;background:linear-gradient(135deg,#1a7a4a,#0f5c34);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:15px 40px;border-radius:12px;letter-spacing:0.5px;">
                      Voir mon historique
                    </a>
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

function buildTransactionValidatedSenderEmail(params: {
  departureLabel: string;
  destinationLabel: string;
  flightDate: string;
  codeUsed: string;
  validatedAt: string;
  senderName: string;
  travelerEmail: string;
}): string {
  const { departureLabel, destinationLabel, flightDate, codeUsed, validatedAt, senderName, travelerEmail } = params;
  const firstName = senderName?.split(' ')[0] ?? 'Expediteur';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Remise de vos bagages confirmée – Donnali</title>
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
                    <span style="font-size:28px;line-height:64px;display:block;">&#128230;</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                Vos bagages ont bien été remis, ${firstName}&nbsp;!
              </h1>
              <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.6;">
                Le voyageur a confirmé la réception de vos colis
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">

              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Le voyageur a validé le code de remise sur place. Vos bagages sont officiellement pris en charge pour ce trajet.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#e6f3fb 0%,#cce7f7 100%);border-radius:14px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Trajet concerné</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="text-align:center;width:40%;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#004c7a;">${departureLabel}</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Départ</p>
                        </td>
                        <td style="text-align:center;width:20%;font-size:22px;color:#0077B6;">&#8594;</td>
                        <td style="text-align:center;width:40%;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#004c7a;">${destinationLabel}</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Arrivée</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;border-top:1px solid #99cfef;">
                      <tr>
                        <td style="padding-top:14px;text-align:center;font-size:14px;color:#005a8f;">
                          Vol le <strong>${flightDate}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Preuve de remise</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                          <span style="font-size:13px;color:#374151;">Code de remise</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;">
                          <span style="font-size:14px;font-weight:800;color:#0077B6;font-family:monospace;letter-spacing:2px;">${codeUsed}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                          <span style="font-size:13px;color:#374151;">Date de validation</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;">
                          <span style="font-size:13px;font-weight:600;color:#1e293b;">${validatedAt}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:13px;color:#374151;">Voyageur</span>
                        </td>
                        <td style="padding:8px 0;text-align:right;">
                          <span style="font-size:13px;font-weight:600;color:#0077B6;">${travelerEmail}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#edf7f1;border-radius:12px;border-left:4px solid #52B788;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:14px;color:#266d4c;line-height:1.6;">
                      <strong>Cet email est votre preuve de remise.</strong> Conservez-le en cas de litige. L'échange est également consultable depuis votre tableau de bord Donnali.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="https://donnali.re" style="display:inline-block;background:linear-gradient(135deg,#0077B6,#005a8f);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:15px 40px;border-radius:12px;letter-spacing:0.5px;">
                      Voir mon tableau de bord
                    </a>
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

    const body = await req.json();
    const { type } = body;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!RESEND_API_KEY) {
      console.info('[email] RESEND_API_KEY not configured — skipping email');
      return new Response(
        JSON.stringify({ success: true, skipped: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (type === 'transaction_validated') {
      const { archive_id } = body;

      if (!archive_id) {
        return new Response(
          JSON.stringify({ error: 'archive_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const { data: archive } = await supabase
        .from('transaction_archives')
        .select('*, listing:listings(departure, destination, flight_date, contact_email), sender:profiles!transaction_archives_sender_id_fkey(full_name), traveler:profiles!transaction_archives_traveler_id_fkey(full_name)')
        .eq('id', archive_id)
        .maybeSingle();

      if (!archive) {
        return new Response(
          JSON.stringify({ error: 'Archive not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const [senderAuthRes, travelerAuthRes] = await Promise.all([
        supabase.auth.admin.getUserById(archive.sender_id),
        supabase.auth.admin.getUserById(archive.traveler_id),
      ]);

      const senderEmail = senderAuthRes.data?.user?.email ?? '';
      const travelerEmail = travelerAuthRes.data?.user?.email ?? '';

      const listing = archive.listing as any;
      const departureLabel = CITY_LABELS[listing?.departure] ?? listing?.departure ?? '';
      const destinationLabel = CITY_LABELS[listing?.destination] ?? listing?.destination ?? '';
      const flightDate = listing?.flight_date
        ? new Date(listing.flight_date).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })
        : '';
      const validatedAt = new Date(archive.validated_at).toLocaleString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      const senderName = (archive.sender as any)?.full_name ?? '';
      const travelerName = (archive.traveler as any)?.full_name ?? '';

      const travelerHtml = buildTransactionValidatedTravelerEmail({
        departureLabel,
        destinationLabel,
        flightDate,
        codeUsed: archive.code_used,
        validatedAt,
        travelerName,
        senderEmail,
      });

      const senderHtml = buildTransactionValidatedSenderEmail({
        departureLabel,
        destinationLabel,
        flightDate,
        codeUsed: archive.code_used,
        validatedAt,
        senderName,
        travelerEmail,
      });

      await Promise.all([
        travelerEmail
          ? fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'Donnali <noreply@donnali.re>',
                to: [travelerEmail],
                subject: 'Remise confirmée – Donnali',
                html: travelerHtml,
              }),
            })
          : Promise.resolve(),
        senderEmail
          ? fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'Donnali <noreply@donnali.re>',
                to: [senderEmail],
                subject: 'Vos bagages ont été remis – Donnali',
                html: senderHtml,
              }),
            })
          : Promise.resolve(),
      ]);

      console.info('[email] Transaction validated emails sent — archive:', archive_id);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (type === 'password_reset') {
      const { email, reset_link } = body;

      if (!email || !reset_link) {
        return new Response(
          JSON.stringify({ error: 'email and reset_link are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const html = buildPasswordResetEmail({ resetLink: reset_link, userEmail: email });

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Donnali <noreply@donnali.re>',
          to: [email],
          subject: 'Réinitialisation de votre mot de passe – Donnali',
          html,
        }),
      });

      if (!resendRes.ok) {
        const err = await resendRes.text();
        console.error('[email] Resend error (password_reset):', err);
      } else {
        console.info('[email] Password reset email sent to:', email);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { listing_id, buyer_id } = body;

    if (!listing_id || !buyer_id) {
      return new Response(
        JSON.stringify({ error: 'listing_id and buyer_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const [listingRes, buyerRes] = await Promise.all([
      supabase
        .from('listings')
        .select('*, profiles(full_name)')
        .eq('id', listing_id)
        .maybeSingle(),
      supabase.auth.admin.getUserById(buyer_id),
    ]);

    if (!listingRes.data) {
      return new Response(
        JSON.stringify({ error: 'Listing not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const listing = listingRes.data;
    const buyer = buyerRes.data?.user;

    const ownerEmail = listing.contact_email;
    const departureLabel = CITY_LABELS[listing.departure] ?? listing.departure;
    const destinationLabel = CITY_LABELS[listing.destination] ?? listing.destination;
    const flightDate = new Date(listing.flight_date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const buyerEmail = buyer?.email ?? 'Un utilisateur';
    const ownerName = (listing.profiles as any)?.full_name ?? '';

    const html = buildContactUnlockedEmail({
      departureLabel,
      destinationLabel,
      flightDate,
      buyerEmail,
      ownerName,
    });

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Donnali <noreply@donnali.re>',
        to: [ownerEmail],
        subject: "Quelqu'un a débloqué vos coordonnées sur Donnali",
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('[email] Resend error (contact_unlocked):', err);
    } else {
      console.info('[email] Contact unlocked email sent to:', ownerEmail);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error: any) {
    console.error('[email] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
