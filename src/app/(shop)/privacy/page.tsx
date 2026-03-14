import type { Metadata } from 'next';
import { PageTitle } from '@/components/ui/page-title';

export const metadata: Metadata = {
  title: 'Privacy Policy - MOS Milano Offre Servizi',
  description: 'Informativa sulla privacy e trattamento dei dati personali di MOS MilanoOffreServizi.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <PageTitle subtitle="Ai sensi del Regolamento UE 2016/679 (GDPR)" className="mb-8">
        Informativa Privacy
      </PageTitle>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Titolare del Trattamento</h2>
          <p>
            Il Titolare del trattamento dei dati personali è <strong>MOS MilanoOffreServizi di Davide Mareggini</strong>,
            con sede legale in Via Romolo Bitti, 28 - 20125 Milano (MI).
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>P.IVA: 08401340966</li>
            <li>REA: MI-2023389</li>
            <li>Email: info@milanooffreservizi.it</li>
            <li>Telefono: 02.6473060</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Tipologia dei Dati Trattati</h2>
          <p>
            I dati personali raccolti includono: nome, cognome, data di nascita, indirizzo, email, telefono,
            codice fiscale, partita IVA, codice SDI/PEC e informazioni relative agli acquisti effettuati.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Finalità del Trattamento</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Registrazione account e gestione ordini:</strong> i dati sono necessari per creare l&apos;account, gestire gli ordini e la fatturazione.</li>
            <li><strong>Assistenza clienti:</strong> per rispondere a richieste di informazioni e supporto.</li>
            <li><strong>Obblighi di legge:</strong> adempimenti fiscali, contabili e normativi.</li>
            <li><strong>Comunicazioni commerciali:</strong> previo consenso, invio di newsletter, promozioni e aggiornamenti sui prodotti.</li>
            <li><strong>Analisi e miglioramento del servizio:</strong> analisi anonime e aggregate per migliorare l&apos;esperienza d&apos;acquisto.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Base Giuridica</h2>
          <p>
            Il trattamento è basato su: esecuzione del contratto (finalità 1-2), obbligo legale (finalità 3),
            consenso dell&apos;interessato (finalità 4), legittimo interesse (finalità 5).
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Natura del Conferimento</h2>
          <p>
            Il conferimento dei dati per le finalità 1-3 è obbligatorio; il mancato conferimento rende impossibile
            l&apos;erogazione del servizio. Il conferimento per le finalità 4-5 è facoltativo.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Modalità e Durata del Trattamento</h2>
          <p>
            I dati sono trattati con strumenti informatici e cartacei, con misure di sicurezza idonee a garantirne
            la riservatezza. I dati saranno conservati per il tempo necessario alle finalità per cui sono raccolti
            e comunque non oltre i termini previsti dalla normativa vigente (10 anni per obblighi fiscali).
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Trasferimento Dati al di fuori dell&apos;UE</h2>
          <p>
            I dati personali non vengono trasferiti al di fuori dell&apos;Unione Europea, salvo utilizzo di servizi
            cloud che garantiscano adeguate garanzie di protezione ai sensi del GDPR (es. clausole contrattuali tipo).
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Diritti dell&apos;Interessato</h2>
          <p>Ai sensi degli artt. 15-22 del GDPR, l&apos;interessato ha diritto di:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Accedere ai propri dati personali</li>
            <li>Ottenere la rettifica o la cancellazione dei dati</li>
            <li>Limitare il trattamento</li>
            <li>Opporsi al trattamento</li>
            <li>Richiedere la portabilità dei dati</li>
            <li>Revocare il consenso in qualsiasi momento</li>
            <li>Proporre reclamo all&apos;Autorità Garante per la Protezione dei Dati Personali</li>
          </ul>
          <p className="mt-2">
            Per esercitare i propri diritti, scrivere a: <strong>info@milanooffreservizi.it</strong>
          </p>
        </section>

        <p className="text-xs text-gray-400 mt-8">Ultimo aggiornamento: Marzo 2026</p>
      </div>
    </div>
  );
}
