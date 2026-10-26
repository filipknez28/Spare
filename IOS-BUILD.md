# Spare za iOS (Capacitor ovoj)

Ta veja vsebuje nativni iOS ovoj za Spare: WebView app (bundle id `com.filipknez.spare`, ime "Spare", ikona že v AppIcon), ki naloži https://spareslo.vercel.app. Nastavitev je v `capacitor.config.json`.

## Kaj je treba še storiti (na Macu)

1. Mac z Xcodeom 16+ (App Store, brezplačen).
2. `git clone -b capacitor-ios https://github.com/filipknez28/Spare.git && cd Spare && npm install`
3. `npx cap sync ios`
4. Odpri `ios/App/App.xcodeproj` v Xcodeu, pod Signing & Capabilities izberi svoj Apple ID (Personal Team), priključi iPhone in klikni Run. Z brezplačnim Apple ID app velja 7 dni (obnoviš s ponovnim Run).
5. Za pravo datoteko .ipa: Product → Archive (to zahteva podpis Apple Developer Program, 99 $/leto; vpis dovoljen od 18. leta, uredi ga odrasel). Alternativa za doma: AltStore/Sideloadly z brezplačnim Apple ID.

## Opombe

- App podatki ostanejo v localStorage (isti izvor kot PWA na spareslo.vercel.app).
- Pravo branje iPhone Screen Time zahteva nativno Swift app z DeviceActivity okvirjem, to ovoj ne obvlada.
- Spremembe spletne app pushaš kot doslej; ovoj ne potrebuje builda, ker naloži Vercel URL.
