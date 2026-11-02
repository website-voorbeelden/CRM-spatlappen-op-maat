# Nieuwe ronde — vijf batches, 31 oktober 2026

Gebruiker heeft eerst alleen een indeling gevraagd en daarna batches 1 tot en met 5 gestart. Deze ronde vervangt geen oudere taken/feedbackstatus en is geen PACKS- of publicatieopdracht. Gedeelde code voor beide bedrijven; leverancierfactuurmatching specifiek Maatwerkkunststof/Kunststofbaas. Bestaande bronwijzigingen, klantgegevens, bestanden/templates en Git-staging behouden.

| Batch / vaste bouwtaak | Scope | Huidige stand |
|---|---|---|
| 1 · crm-finance31-batch1 | Feedback inventariseren, gerichte codelezing en kritieke dagelijkse bediening | Bronwerk klaar voor eigen controle, lokaal. 94 meldingen geïnventariseerd, geen algemene foutloosheidsclaim. |
| 2 · crm-finance31-batch2 | Bestaande inkoop/invoer-btw/AI/opslag/berekeningen nalopen en eenvoudiger bedienen; inbegrepen transport eenmaal toerekenen | Lokaal brongebouwd voor eigen controle: apart kostenformulier/overzicht, expliciete transportbasis, onbekende btw/uitgaven zichtbaar; zie INKOOP-BATCH2-20261031.md. |
| 3 · crm-finance31-batch3 | Alle bedrijfskosten, ook zonder order: bezorger/vervoerder/bank/overig, bewijs, betaling en btw apart | Lokaal brongebouwd voor eigen controle: kosten/btw/betaling/bewijs en bewaakte bestaande kostenbron; zie BEDRIJFSKOSTEN-BATCH3-20261031.md. |
| 4 · crm-finance31-batch4 | Kunststofbaas-facturen lezen, regels/bedragen voorstellen en via leveranciersnummer aan order/klant koppelen | Lokaal brongebouwd voor eigen controle: PDF-tekst/eigen AI, één factuur over gekozen orders en bewaakte exacte kosten/btw/bewijs; privélinks leverden geen PDF. Zie KUNSTSTOFBAAS-FACTUURINVOER-BATCH4-20261031.md. |
| 5 · crm-finance31-batch5 | Overboekingen naar jezelf afzonderlijk, per-bedrijfskosten/btw/geldstromen en periode-export | Lokaal brongebouwd voor eigen controle: afzonderlijke bronkosten/kas/btw, VOF-privéregistratie met historie, per-persoonoverzicht, periode-/controle-export en optionele invoer-btw-datums. Zie FINANCIEEL-BATCH5-20261031.md. |

Zie [batch1](FEEDBACK-AUDIT-BATCH1-20261031.md). Alle vijf batches van deze ronde zijn lokaal brongebouwd voor eigen controle. Gebruikerscontrole van alle vijf blijft open; eerdere gedeeltelijke feedback en PACKS-restbouw zijn hiermee niet afgehandeld. Geen automatische tests/checks/syntaxchecks/builds/browser-QA; Philippe controleert zelf. GitHubupload en livepublicatie afzonderlijk. Nieuwste gebruikersantwoord: Alles lokaal houden. Ook de orderherstelkandidaten worden niet geüpload/gepubliceerd.
