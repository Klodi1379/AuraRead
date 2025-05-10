# AuraRead Backend

Ky është backend-i i aplikacionit AuraRead, i ndërtuar me Django dhe Django REST Framework.

## Veçoritë

- Autentikim i bazuar në token
- Ngarkimi dhe menaxhimi i dokumenteve PDF
- Ekstraktimi i tekstit nga PDF-të
- Konvertimi i tekstit në të folur
- Krijimi dhe menaxhimi i anotimeve

## Ndryshimet e fundit

- Heqja e fushës `extracted_text` nga modeli `Document`
- Shtimi i endpoint-it të ri `/extract_text/` për ekstraktimin e tekstit në kohë reale
- Shtimi i fushës `page_number` në modelin `Annotation`
- Përmirësimi i logjikës së ekstraktimit të tekstit

## Për zhvilluesit

- Nëse ndryshoni modelet, gjithmonë ekzekutoni `python manage.py makemigrations` dhe `python manage.py migrate`
- Përdorni `python manage.py runserver` për të nisur serverin e zhvillimit
- Kujdesuni që të keni përgatitur komandën `setadminpassword` për të vendosur fjalëkalimin e administratorit
