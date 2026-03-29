import { useState } from 'react';

const SAMPLE_CONTACT_UNLOCKED = `<!DOCTYPE html>
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
                Bonne nouvelle, Marie&nbsp;!
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
                          <p style="margin:0;font-size:20px;font-weight:800;color:#004c7a;">La Réunion</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Départ</p>
                        </td>
                        <td style="text-align:center;width:20%;font-size:22px;color:#0077B6;">&#8594;</td>
                        <td style="text-align:center;width:40%;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#004c7a;">Paris</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Arrivée</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;border-top:1px solid #99cfef;">
                      <tr>
                        <td style="padding-top:14px;text-align:center;font-size:14px;color:#005a8f;">
                          Vol le <strong>samedi 25 avril 2026</strong>
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
                          <p style="margin:0;font-size:15px;font-weight:700;color:#1e293b;">jean.dupont@gmail.com</p>
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
                    <a href="#" style="display:inline-block;background:linear-gradient(135deg,#0077B6,#005a8f);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:15px 40px;border-radius:12px;letter-spacing:0.5px;">
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

const SAMPLE_EMAIL_CONFIRMATION = `<!DOCTYPE html>
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
                    <a href="#" style="display:inline-block;background:linear-gradient(135deg,#0077B6,#005a8f);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 44px;border-radius:12px;letter-spacing:0.5px;">
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
                    <p style="margin:0;font-size:12px;color:#0077B6;word-break:break-all;">https://donnali.re/auth/v1/verify?token=eyJhbGciOiJIUzI1NiJ9.exemple&type=signup&redirect_to=https://donnali.re/</p>
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

const SAMPLE_PASSWORD_RESET = `<!DOCTYPE html>
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
                Nous avons reçu une demande de réinitialisation du mot de passe associé à l'adresse <strong style="color:#0077B6;">marie.martin@example.com</strong>.
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
                          <span style="font-size:13px;font-weight:600;color:#1e293b;">marie.martin@example.com</span>
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
                    <a href="#" style="display:inline-block;background:linear-gradient(135deg,#0077B6,#005a8f);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 44px;border-radius:12px;letter-spacing:0.5px;">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:12px;color:#64748b;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
                    <p style="margin:0;font-size:12px;color:#0077B6;word-break:break-all;">https://donnali.re/reset-password?token=eyJhbGciOiJIUzI1NiJ9.exemple</p>
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

const SAMPLE_NEWSLETTER = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Un voyageur correspond a votre alerte – Donnali</title>
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
                Un voyageur voyage vers La Réunion&nbsp;!
              </h1>
              <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.6;">
                Une nouvelle annonce correspond à votre alerte newsletter
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">

              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Bonne nouvelle ! Un voyageur vient de publier une annonce sur le trajet <strong style="color:#0077B6;">Paris → La Réunion</strong> qui correspond à votre abonnement.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#e6f3fb 0%,#cce7f7 100%);border-radius:14px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Itinéraire du voyage</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="text-align:center;width:40%;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#004c7a;">Paris</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Départ</p>
                        </td>
                        <td style="text-align:center;width:20%;font-size:22px;color:#0077B6;">&#8594;</td>
                        <td style="text-align:center;width:40%;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#004c7a;">La Réunion</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Arrivée</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;border-top:1px solid #99cfef;">
                      <tr>
                        <td style="padding-top:14px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="text-align:center;width:50%;padding:8px 0;">
                                <p style="margin:0;font-size:13px;font-weight:700;color:#005a8f;">samedi 18 avril 2026</p>
                                <p style="margin:2px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Date du vol</p>
                              </td>
                              <td style="text-align:center;width:50%;padding:8px 0;border-left:1px solid #99cfef;">
                                <p style="margin:0;font-size:13px;font-weight:700;color:#005a8f;">15 kg disponibles</p>
                                <p style="margin:2px 0 0;font-size:11px;color:#0077B6;text-transform:uppercase;letter-spacing:1px;">Capacité</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Le voyageur</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="vertical-align:top;width:44px;">
                          <div style="width:40px;height:40px;background:linear-gradient(135deg,#0077B6,#005a8f);border-radius:50%;text-align:center;line-height:40px;">
                            <span style="color:#ffffff;font-size:16px;font-weight:700;">M</span>
                          </div>
                        </td>
                        <td style="padding-left:12px;vertical-align:top;">
                          <p style="margin:0;font-size:15px;font-weight:700;color:#1e293b;">
                            Martin J.
                            <span style="display:inline-block;background-color:#dcfce7;color:#166534;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:6px;vertical-align:middle;">Identité vérifiée</span>
                            <span style="display:inline-block;background-color:#dbeafe;color:#1e40af;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:4px;vertical-align:middle;">Vol confirmé</span>
                          </p>
                          <p style="margin:4px 0 0;font-size:12px;color:#64748b;">Note : 4.8/5 (12 avis)</p>
                        </td>
                        <td style="text-align:right;vertical-align:top;">
                          <p style="margin:0;font-size:16px;font-weight:800;color:#0077B6;">5 €/kg</p>
                          <p style="margin:2px 0 0;font-size:11px;color:#94a3b8;">par kilo</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Ce que dit le voyageur</p>
                    <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;font-style:italic;">"Je voyage régulièrement entre Paris et La Réunion pour le travail. Fiable et ponctuel, je peux transporter vêtements, médicaments et petits colis."</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff8e6;border-radius:12px;border-left:4px solid #f59e0b;margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                      Pour voir les coordonnées complètes du voyageur et le contacter, rendez-vous sur l'annonce.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td align="center">
                    <a href="#" style="display:inline-block;background:linear-gradient(135deg,#0077B6,#005a8f);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 44px;border-radius:12px;letter-spacing:0.5px;">
                      Voir l'annonce complète
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
                Vous recevez cet email car vous êtes abonné aux alertes Donnali.<br/>
                <a href="#" style="color:#94a3b8;">Se désabonner</a> &mdash; &copy; 2026 Donnali
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

type EmailType = 'contact_unlocked' | 'email_confirmation' | 'password_reset' | 'newsletter_alert';

export function EmailPreviewPage() {
  const [active, setActive] = useState<EmailType>('email_confirmation');

  const templates: { id: EmailType; label: string; subject: string }[] = [
    {
      id: 'email_confirmation',
      label: 'Confirmation email',
      subject: 'Confirmez votre adresse email – Donnali',
    },
    {
      id: 'contact_unlocked',
      label: 'Contact débloqué',
      subject: "Quelqu'un a débloqué vos coordonnées sur Donnali",
    },
    {
      id: 'password_reset',
      label: 'Réinitialisation mot de passe',
      subject: 'Réinitialisation de votre mot de passe – Donnali',
    },
    {
      id: 'newsletter_alert',
      label: 'Alerte newsletter',
      subject: 'Nouveau voyageur Paris → La Réunion – Donnali',
    },
  ];

  const htmlMap: Record<EmailType, string> = {
    email_confirmation: SAMPLE_EMAIL_CONFIRMATION,
    contact_unlocked: SAMPLE_CONTACT_UNLOCKED,
    password_reset: SAMPLE_PASSWORD_RESET,
    newsletter_alert: SAMPLE_NEWSLETTER,
  };
  const html = htmlMap[active];
  const current = templates.find((t) => t.id === active)!;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-sm font-semibold text-gray-700">Prévisualisation des emails</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">DEV ONLY</span>
        </div>
        <div className="flex gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active === t.id
                  ? 'bg-ocean-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-start gap-3">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-14 flex-shrink-0">Objet</span>
                <span className="text-sm font-semibold text-gray-800 truncate">{current.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-14 flex-shrink-0">De</span>
                <span className="text-sm text-gray-600">Donnali &lt;noreply@donnali.re&gt;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-14 flex-shrink-0">À</span>
                <span className="text-sm text-gray-600">
                  {active === 'contact_unlocked' ? 'marie.martin@example.com' : 'marie.martin@example.com'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <iframe
            srcDoc={html}
            title={`Aperçu email – ${current.label}`}
            className="w-full border-0"
            style={{ height: '800px' }}
          />
        </div>
      </div>
    </div>
  );
}
