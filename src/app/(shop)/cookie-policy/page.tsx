import type { Metadata } from 'next';
import { PageTitle } from '@/components/ui/page-title';

export const metadata: Metadata = {
  title: 'Cookie Policy - MOS Milano Offre Servizi',
  description: 'Informativa sull\'utilizzo dei cookie sul sito MOS MilanoOffreServizi.',
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <PageTitle subtitle="Informativa sull'utilizzo dei cookie" className="mb-8">
        Cookie Policy
      </PageTitle>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Cosa sono i Cookie</h2>
          <p>
            I cookie sono piccoli file di testo che i siti visitati inviano al browser dell&apos;utente, dove vengono
            memorizzati per essere poi ritrasmessi agli stessi siti alla visita successiva. Sono utilizzati per
            diverse finalità, come il riconoscimento dell&apos;utente, il monitoraggio delle sessioni e la
            memorizzazione di preferenze.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Cookie Tecnici (Necessari)</h2>
          <p>
            Questi cookie sono essenziali per il funzionamento del sito e non possono essere disattivati.
            Vengono utilizzati per:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gestione della sessione di navigazione e del login</li>
            <li>Memorizzazione del carrello acquisti</li>
            <li>Preferenze di visualizzazione e consenso cookie</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Cookie Analitici</h2>
          <p>
            Utilizziamo cookie analitici per raccogliere informazioni in forma aggregata e anonima sul numero
            degli utenti e su come questi visitano il sito. Questo ci aiuta a migliorare l&apos;esperienza di navigazione.
          </p>
          <p>Servizi utilizzati:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Google Analytics:</strong> servizio di analisi web fornito da Google LLC. I dati sono
              raccolti in forma anonima e aggregata.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Cookie di Terze Parti</h2>
          <p>
            Il sito potrebbe includere componenti di terze parti che utilizzano propri cookie:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Google Fonts:</strong> per il caricamento dei caratteri tipografici</li>
            <li><strong>Servizi di pagamento:</strong> per la gestione sicura delle transazioni</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Gestione dei Cookie</h2>
          <p>
            L&apos;utente può gestire le preferenze relative ai cookie direttamente all&apos;interno del proprio browser,
            impedendone l&apos;installazione o eliminando quelli già memorizzati. La disattivazione dei cookie tecnici
            potrebbe compromettere alcune funzionalità del sito.
          </p>
          <p>Istruzioni per i principali browser:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Chrome:</strong> Impostazioni &gt; Privacy e sicurezza &gt; Cookie</li>
            <li><strong>Firefox:</strong> Impostazioni &gt; Privacy e sicurezza &gt; Cookie</li>
            <li><strong>Safari:</strong> Preferenze &gt; Privacy &gt; Gestisci dati siti web</li>
            <li><strong>Edge:</strong> Impostazioni &gt; Cookie e autorizzazioni sito</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Titolare del Trattamento</h2>
          <p>
            <strong>MOS MilanoOffreServizi di Davide Mareggini</strong><br />
            Via Romolo Bitti, 28 - 20125 Milano (MI)<br />
            Email: info@milanooffreservizi.it<br />
            Per maggiori informazioni, consultare la nostra{' '}
            <a href="/privacy" className="text-blue hover:underline">Informativa Privacy</a>.
          </p>
        </section>

        <p className="text-xs text-gray-400 mt-8">Ultimo aggiornamento: Marzo 2026</p>
      </div>
    </div>
  );
}
