import SEOHead from '@/components/seo/SEOHead';

export default function TermsPage() {
  return (
    <>
      <SEOHead
        title="Termeni și Condiții | HelpMeClean.ro"
        description="Termenii și condițiile de utilizare ale platformei HelpMeClean.ro."
        canonicalUrl="/termeni"
        noIndex={true}
      />
      <div className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Termeni și Condiții</h1>
            <p className="text-gray-500">
              Ultima actualizare: <time dateTime="2024-01-01">1 ianuarie 2024</time>
            </p>
            <p className="text-gray-600 mt-4 leading-relaxed">
              Vă rugăm să citiți cu atenție acești Termeni și Condiții înainte de a utiliza platforma
              HelpMeClean.ro. Prin accesarea sau utilizarea serviciilor noastre, sunteți de acord cu
              acești termeni.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-10 text-gray-700">
            {/* 1. Definiții */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Definiții</h2>
              <p className="leading-relaxed mb-4">
                În cuprinsul prezentului document, termenii de mai jos au următoarele semnificații:
              </p>
              <ul className="space-y-3">
                {[
                  ['Platforma', 'site-ul web helpmeclean.ro și aplicațiile asociate, operate de HelpMeClean SRL'],
                  ['Utilizator', 'orice persoană fizică sau juridică care accesează sau utilizează Platforma'],
                  ['Client', 'utilizatorul care comandă servicii de curățenie prin Platformă'],
                  ['Firmă parteneră', 'compania de curățenie verificată și aprobată care prestează servicii prin Platformă'],
                  ['Serviciu', 'prestarea de curățenie rezervată și plătită prin intermediul Platformei'],
                  ['Cont', 'contul creat de Utilizator pentru accesarea funcționalităților Platformei'],
                ].map(([term, def]) => (
                  <li key={term} className="flex gap-2">
                    <span className="font-semibold text-gray-900 shrink-0">„{term}"</span>
                    <span>— {def};</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 2. Utilizarea platformei */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Utilizarea platformei</h2>
              <p className="leading-relaxed mb-4">
                HelpMeClean.ro este o platformă de intermediere care facilitează legătura între
                Clienți și Firmele partenere de curățenie. Platforma nu este furnizorul direct al
                serviciilor de curățenie.
              </p>
              <p className="leading-relaxed mb-4">
                Utilizarea Platformei este permisă persoanelor cu vârsta de cel puțin 18 ani.
                Prin crearea unui cont, confirmați că aveți capacitate juridică deplină.
              </p>
              <p className="leading-relaxed">
                Rezervările efectuate prin Platformă constituie contracte directe între Client și
                Firma parteneră. HelpMeClean SRL acționează exclusiv ca intermediar și nu este parte
                în contractul de prestare a serviciilor de curățenie.
              </p>
            </section>

            {/* 3. Obligațiile utilizatorului */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Obligațiile utilizatorului</h2>
              <p className="leading-relaxed mb-4">Utilizatorii Platformei se obligă:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Să furnizeze informații corecte și complete la înregistrare și la plasarea comenzilor;</li>
                <li>Să nu utilizeze Platforma în scopuri ilegale sau contrare ordinii publice;</li>
                <li>Să nu perturbe funcționarea normală a Platformei sau a altor utilizatori;</li>
                <li>Să nu reproducă, distribuie sau modifice conținutul Platformei fără acordul scris al HelpMeClean SRL;</li>
                <li>Să respecte confidențialitatea datelor de acces la cont;</li>
                <li>Să achite contravaloarea serviciilor rezervate conform prețurilor afișate;</li>
                <li>Să permită accesul echipei de curățenie la adresa specificată la data rezervată.</li>
              </ul>
            </section>

            {/* 4. Prețuri și plăți */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prețuri și plăți</h2>
              <p className="leading-relaxed mb-4">
                Toate prețurile afișate pe Platformă includ TVA acolo unde este aplicabil și sunt
                exprimate în lei românești (RON). Prețul final al serviciului se calculează
                automat pe baza suprafeței, numărului de camere și serviciilor suplimentare alese.
              </p>
              <p className="leading-relaxed mb-4">
                Plata se efectuează electronic, prin card bancar, prin intermediul procesorului de
                plăți Stripe. HelpMeClean SRL nu stochează datele cardului dumneavoastră.
              </p>
              <p className="leading-relaxed">
                HelpMeClean SRL percepe un comision de intermediere din valoarea fiecărei tranzacții.
                Comisionul este inclus în prețul final afișat Clientului.
              </p>
            </section>

            {/* 5. Anulare și rambursare */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Anulare și rambursare</h2>
              <p className="leading-relaxed mb-4">
                Clientul poate anula o rezervare gratuit cu cel puțin 24 de ore înainte de ora
                programată. Anulările efectuate cu mai puțin de 24 de ore pot fi supuse unei taxe
                de anulare conform politicii Firmei partenere.
              </p>
              <p className="leading-relaxed">
                În cazul în care serviciul nu a fost prestat conform contractului, Clientul poate
                solicita o rambursare parțială sau totală prin intermediul Platformei, în termen de
                48 de ore de la finalizarea programată a serviciului. Cererile de rambursare sunt
                analizate individual de echipa HelpMeClean.
              </p>
            </section>

            {/* 6. Răspundere */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Răspundere</h2>
              <p className="leading-relaxed mb-4">
                HelpMeClean SRL nu răspunde pentru prejudiciile directe sau indirecte cauzate de
                neîndeplinirea obligațiilor contractuale de către Firmele partenere. Răspunderea
                noastră în calitate de intermediar este limitată la valoarea comisionului de
                intermediere perceput pentru tranzacția respectivă.
              </p>
              <p className="leading-relaxed">
                Firmele partenere sunt obligate să dețină asigurare civilă profesională activă pe
                durata întregii colaborări cu HelpMeClean. Verificarea documentelor de asigurare
                se efectuează la onboardingul fiecărei firme și periodic ulterior.
              </p>
            </section>

            {/* 7. Modificări */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modificări ale termenilor</h2>
              <p className="leading-relaxed">
                HelpMeClean SRL își rezervă dreptul de a modifica acești Termeni și Condiții în
                orice moment. Modificările intră în vigoare la data publicării pe Platformă.
                Continuarea utilizării Platformei după publicarea modificărilor constituie acceptul
                noilor termeni. Vă recomandăm să verificați periodic această pagină.
              </p>
            </section>

            {/* 8. Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact</h2>
              <p className="leading-relaxed">
                Pentru orice întrebări referitoare la acești Termeni și Condiții, ne puteți contacta
                la adresa de email{' '}
                <a href="mailto:contact@helpmeclean.ro" className="text-blue-600 hover:underline">
                  contact@helpmeclean.ro
                </a>{' '}
                sau la sediul social al HelpMeClean SRL, București, România.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
