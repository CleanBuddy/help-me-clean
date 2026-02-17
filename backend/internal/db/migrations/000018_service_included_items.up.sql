ALTER TABLE service_definitions
  ADD COLUMN included_items TEXT[] NOT NULL DEFAULT '{}';

UPDATE service_definitions SET included_items = ARRAY[
  'Aspirat și șters praf',
  'Curățat baie și bucătărie',
  'Curățat suprafețe și mobilier',
  'Spălat podele'
] WHERE service_type = 'standard_cleaning';

UPDATE service_definitions SET included_items = ARRAY[
  'Tot ce include Curățenia Standard',
  'Dezinfectat și igienizat complet',
  'Curățat în profunzime mobilier și suprafețe',
  'Curățat zone greu accesibile'
] WHERE service_type = 'deep_cleaning';

UPDATE service_definitions SET included_items = ARRAY[
  'Curățenie profundă completă',
  'Curățat dulapuri și sertare',
  'Curățat toate electrocasnicele',
  'Ideal pentru predare apartament'
] WHERE service_type = 'move_in_out_cleaning';

UPDATE service_definitions SET included_items = ARRAY[
  'Îndepărtat praf de construcție',
  'Curățat reziduuri de vopsea',
  'Lustruit suprafețe',
  'Curățat geamuri și rame'
] WHERE service_type = 'post_construction';

UPDATE service_definitions SET included_items = ARRAY[
  'Curățat spații de lucru',
  'Igienizat zone comune',
  'Aspirat și spălat podele',
  'Golit coșuri de gunoi'
] WHERE service_type = 'office_cleaning';

UPDATE service_definitions SET included_items = ARRAY[
  'Spălat geamuri interior/exterior',
  'Curățat tocuri și pervazuri',
  'Lustruit geamuri fără urme'
] WHERE service_type = 'window_cleaning';
