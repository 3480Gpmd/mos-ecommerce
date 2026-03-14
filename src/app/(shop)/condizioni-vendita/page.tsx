import type { Metadata } from 'next';
import { PageTitle } from '@/components/ui/page-title';

export const metadata: Metadata = {
  title: 'Condizioni di Vendita - MOS Milano Offre Servizi',
  description: 'Termini e condizioni generali di vendita di MOS MilanoOffreServizi.',
};

export default function CondizioniVenditaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <PageTitle subtitle="Termini e condizioni generali di vendita" className="mb-8">
        Condizioni di Vendita
      </PageTitle>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 1 - Disposizioni Generali</h2>
          <p>
            Le presenti condizioni generali di vendita disciplinano l&apos;acquisto di prodotti tramite il sito
            internet di <strong>MOS MilanoOffreServizi di Davide Mareggini</strong>, con sede in Via Romolo Bitti, 28 -
            20125 Milano (MI), P.IVA 08401340966, REA MI-2023389.
          </p>
          <p>
            La navigazione e la trasmissione di un ordine di acquisto sul sito comportano l&apos;accettazione delle
            presenti condizioni e delle politiche di protezione dei dati personali.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 2 - Oggetto</h2>
          <p>
            Le presenti condizioni regolano gli ordini di acquisto dei prodotti presenti sul sito, inclusi materiali
            di consumo per stampa, caffè e bevande calde in capsule, materiale per ufficio e accessori.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 3 - Conclusione del Contratto</h2>
          <p>
            Il contratto si conclude con la compilazione del modulo d&apos;ordine elettronico e l&apos;invio dello stesso
            seguendo le istruzioni indicate. L&apos;ordine si intende confermato con l&apos;invio della conferma
            d&apos;ordine via email.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 4 - Utenti Registrati</h2>
          <p>
            L&apos;utente è tenuto a fornire dati personali veritieri, corretti e completi. L&apos;utente è responsabile
            della custodia delle proprie credenziali di accesso e di ogni attività svolta tramite il proprio account.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 5 - Disponibilità Prodotti</h2>
          <p>
            La disponibilità dei prodotti è indicata al momento dell&apos;ordine ma resta indicativa, in quanto
            acquisti contemporanei potrebbero influire sulla giacenza. In caso di indisponibilità, il cliente
            sarà tempestivamente informato.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 6 - Prezzi e Pagamenti</h2>
          <p>I prezzi indicati sul sito sono espressi in Euro e si intendono IVA esclusa, salvo diversa indicazione.</p>
          <p>Metodi di pagamento accettati:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Bonifico bancario (anticipato)</li>
            <li>Carta di credito / PayPal</li>
            <li>Satispay</li>
            <li>Contrassegno (solo Milano e provincia, supplemento di 4&euro;)</li>
            <li>Contanti, bancomat o carta alla consegna (solo Milano e provincia)</li>
          </ul>
          <p>I prezzi possono essere soggetti a variazione, fatti salvi gli ordini già confermati.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 7 - Consegna</h2>
          <p>Le spedizioni avvengono su tutto il territorio italiano. Tempi indicativi di consegna: 24/48 ore lavorative.</p>
          <p>Costi di spedizione:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Milano città:</strong> gratuita per ordini sopra 50&euro;, altrimenti 5&euro;</li>
            <li><strong>Provincia di Milano:</strong> gratuita per ordini sopra 90&euro;, altrimenti 10&euro;</li>
            <li><strong>Tutta Italia:</strong> gratuita per ordini sopra 300&euro;; 10&euro; per ordini tra 100-300&euro;; 15&euro; sotto 100&euro;</li>
          </ul>
          <p>Non si effettuano consegne il sabato e la domenica.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 8 - Passaggio del Rischio</h2>
          <p>
            Il rischio di perdita o danneggiamento dei prodotti si trasferisce all&apos;acquirente al momento della
            consegna. La proprietà si acquisisce al momento del pagamento integrale o della consegna, se successiva.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 9 - Garanzia e Conformità</h2>
          <p>
            Il venditore è responsabile per qualsiasi difetto di conformità dei prodotti. La garanzia legale ha
            durata di 24 mesi dalla consegna per i consumatori. Il difetto deve essere denunciato entro 2 mesi
            dalla scoperta.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 10 - Diritto di Recesso</h2>
          <p>
            Ai sensi del D.lgs 206/2005 (Codice del Consumo), il consumatore ha diritto di recedere dal contratto
            entro 14 giorni dalla ricezione dei prodotti, senza indicarne le ragioni e senza penalità.
          </p>
          <p>Condizioni per il recesso:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>La merce deve essere restituita integra e nella confezione originale</li>
            <li>Il prodotto non deve essere stato utilizzato</li>
            <li>Il reso deve includere tutta la documentazione allegata</li>
          </ul>
          <p>
            Il rimborso avverrà entro 30 giorni dalla comunicazione di recesso, con lo stesso mezzo di pagamento
            utilizzato per l&apos;acquisto. Le spese di restituzione per prodotti non difettosi sono a carico del cliente.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 11 - Trattamento Dati</h2>
          <p>
            I dati personali sono trattati ai sensi del Regolamento UE 2016/679 (GDPR). Per maggiori informazioni,
            consultare la nostra <a href="/privacy" className="text-blue hover:underline">Informativa Privacy</a>.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 12 - Clausola di Salvaguardia</h2>
          <p>
            L&apos;eventuale invalidità di una clausola non compromette la validità delle restanti disposizioni.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 13 - Contatti</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Email: info@milanooffreservizi.it</li>
            <li>Telefono: 02.6473060</li>
            <li>Sede: Via Romolo Bitti, 28 - 20125 Milano (MI)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy">Art. 14 - Legge Applicabile e Foro Competente</h2>
          <p>
            Le presenti condizioni sono regolate dalla legge italiana. Per le controversie con consumatori,
            è competente il foro del luogo di residenza del consumatore.
          </p>
        </section>

        <p className="text-xs text-gray-400 mt-8">Ultimo aggiornamento: Marzo 2026</p>
      </div>
    </div>
  );
}
