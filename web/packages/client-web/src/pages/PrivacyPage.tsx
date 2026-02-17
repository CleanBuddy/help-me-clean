import SEOHead from '@/components/seo/SEOHead';

export default function PrivacyPage() {
  return (
    <>
      <SEOHead
        title="Politica de Confidențialitate | HelpMeClean.ro"
        description="Politica de confidențialitate și protecția datelor cu caracter personal pe platforma HelpMeClean.ro, conform GDPR."
        canonicalUrl="/confidentialitate"
        noIndex={true}
      />
      <div className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Politica de Confidențialitate</h1>
            <p className="text-gray-500">
              Ultima actualizare: <time dateTime="2024-01-01">1 ianuarie 2024</time>
            </p>
            <p className="text-gray-600 mt-4 leading-relaxed">
              HelpMeClean SRL respectă dreptul la confidențialitate al utilizatorilor și se angajează
              să protejeze datele cu caracter personal în conformitate cu Regulamentul (UE) 2016/679
              (GDPR) și legislația națională aplicabilă. Această politică descrie tipurile de date
              colectate, scopul prelucrării și drepturile dumneavoastră.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-10 text-gray-700">
            {/* 1. Operatorul de date */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Operatorul de date</h2>
              <p className="leading-relaxed">
                Operatorul de date cu caracter personal este <strong>HelpMeClean SRL</strong>,
                cu sediul în București, România. Ne puteți contacta pentru orice aspect legat de
                prelucrarea datelor la adresa:{' '}
                <a href="mailto:dpo@helpmeclean.ro" className="text-blue-600 hover:underline">
                  dpo@helpmeclean.ro
                </a>
                .
              </p>
            </section>

            {/* 2. Datele colectate */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Datele colectate</h2>
              <p className="leading-relaxed mb-4">
                În funcție de modul în care utilizați Platforma, colectăm următoarele categorii de date:
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: 'Date de identificare',
                    items: ['Nume și prenume', 'Adresă de email', 'Număr de telefon', 'Fotografie de profil (opțional)'],
                  },
                  {
                    title: 'Date de localizare și adresă',
                    items: ['Adresa pentru prestarea serviciului', 'Oraș și județ', 'Coordonate GPS (opțional, pentru optimizarea rutelor)'],
                  },
                  {
                    title: 'Date de plată',
                    items: ['Date card procesate de Stripe (nu le stocăm direct)', 'Istoricul tranzacțiilor', 'Date de facturare (CUI, adresă fiscală)'],
                  },
                  {
                    title: 'Date de utilizare',
                    items: ['Istoricul rezervărilor', 'Recenzii și evaluări', 'Mesaje în chat-ul platformei', 'Date de acces (IP, browser, sistem de operare)'],
                  },
                ].map(({ title, items }) => (
                  <div key={title} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Scopul prelucrării */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Scopul prelucrării</h2>
              <p className="leading-relaxed mb-4">Prelucrăm datele dumneavoastră în următoarele scopuri:</p>
              <ul className="space-y-3">
                {[
                  ['Executarea contractului', 'procesarea și gestionarea rezervărilor de servicii de curățenie'],
                  ['Comunicare', 'notificări despre statusul rezervărilor, chat cu firma de curățenie, suport'],
                  ['Plăți', 'procesarea tranzacțiilor financiare și emiterea facturilor'],
                  ['Securitate', 'prevenirea fraudelor, verificarea identității, protejarea conturilor'],
                  ['Îmbunătățirea serviciului', 'analize statistice anonimizate pentru îmbunătățirea platformei'],
                  ['Obligații legale', 'respectarea cerințelor fiscale și a altor reglementări aplicabile'],
                ].map(([scope, desc]) => (
                  <li key={scope} className="flex gap-2">
                    <span className="font-semibold text-gray-900 shrink-0">{scope}:</span>
                    <span>{desc};</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 4. Temeiul juridic */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Temeiul juridic al prelucrării</h2>
              <p className="leading-relaxed mb-4">Prelucrăm datele dumneavoastră pe baza:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Executării contractului (Art. 6 alin. 1 lit. b GDPR) — pentru gestionarea rezervărilor și plăților;</li>
                <li>Consimțământului (Art. 6 alin. 1 lit. a GDPR) — pentru comunicări de marketing, dacă ați optat;</li>
                <li>Interesului legitim (Art. 6 alin. 1 lit. f GDPR) — pentru prevenirea fraudelor și securitatea platformei;</li>
                <li>Obligației legale (Art. 6 alin. 1 lit. c GDPR) — pentru obligații fiscale și contabile.</li>
              </ul>
            </section>

            {/* 5. Drepturile tale */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Drepturile dumneavoastră</h2>
              <p className="leading-relaxed mb-4">
                Conform GDPR, beneficiați de următoarele drepturi în legătură cu datele dumneavoastră:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { right: 'Dreptul de acces', desc: 'Puteți solicita o copie a datelor pe care le deținem despre dumneavoastră.' },
                  { right: 'Dreptul la rectificare', desc: 'Puteți corecta datele inexacte sau incomplete în orice moment.' },
                  { right: 'Dreptul la ștergere', desc: 'Puteți solicita ștergerea datelor, cu anumite excepții legale.' },
                  { right: 'Dreptul la portabilitate', desc: 'Puteți primi datele dumneavoastră într-un format structurat.' },
                  { right: 'Dreptul la opoziție', desc: 'Puteți obiecta la prelucrarea datelor bazată pe interes legitim.' },
                  { right: 'Dreptul la restricție', desc: 'Puteți solicita limitarea prelucrării în anumite circumstanțe.' },
                ].map(({ right, desc }) => (
                  <div key={right} className="p-4 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{right}</h3>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed">
                Pentru a vă exercita drepturile, contactați-ne la{' '}
                <a href="mailto:dpo@helpmeclean.ro" className="text-blue-600 hover:underline">
                  dpo@helpmeclean.ro
                </a>
                . Veți primi un răspuns în termen de 30 de zile. Aveți de asemenea dreptul de a depune
                o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter
                Personal (ANSPDCP).
              </p>
            </section>

            {/* 6. Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies</h2>
              <p className="leading-relaxed mb-4">
                Platforma utilizează cookies și tehnologii similare pentru a asigura funcționarea
                corectă a serviciilor și pentru a analiza traficul.
              </p>
              <div className="space-y-3">
                {[
                  { type: 'Cookies esențiale', desc: 'Necesare pentru funcționarea platformei (autentificare, sesiune). Nu pot fi dezactivate.' },
                  { type: 'Cookies analitice', desc: 'Colectăm date anonimizate de utilizare prin Google Analytics pentru a îmbunătăți platforma.' },
                  { type: 'Cookies funcționale', desc: 'Rețin preferințele dumneavoastră (limbă, setări) pentru o experiență mai bună.' },
                ].map(({ type, desc }) => (
                  <div key={type} className="flex gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">{type}: </span>
                      <span className="text-sm text-gray-600">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. Retenție date */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Durata retenției datelor</h2>
              <p className="leading-relaxed">
                Păstrăm datele dumneavoastră atât timp cât este necesar pentru scopurile descrise
                mai sus sau cât impun obligațiile legale. Datele din contul dumneavoastră sunt
                păstrate pe toată durata utilizării serviciului. La ștergerea contului, datele
                personale sunt anonimizate sau șterse în termen de 30 de zile, cu excepția
                datelor necesare pentru obligații fiscale (păstrate 10 ani conform legii).
              </p>
            </section>

            {/* 8. Contact DPO */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact DPO</h2>
              <p className="leading-relaxed">
                Responsabilul nostru cu protecția datelor (Data Protection Officer) poate fi contactat
                la adresa:{' '}
                <a href="mailto:dpo@helpmeclean.ro" className="text-blue-600 hover:underline">
                  dpo@helpmeclean.ro
                </a>
                . Orice întrebare, solicitare sau plângere legată de prelucrarea datelor cu caracter
                personal poate fi adresată la această adresă.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
