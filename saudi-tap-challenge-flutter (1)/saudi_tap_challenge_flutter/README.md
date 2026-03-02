# Saudi Tap Challenge (Flutter) 🇸🇦

لعبة "تحدي النقر" بسيطة وسريعة مناسبة للموبايل وتربح من الإعلانات.

## المزايا
- لعب 10 ثواني: اجمع أكبر عدد نقرات
- حفظ أفضل نتيجة على الجهاز
- Rewarded Ad (اختياري): مشاهدة إعلان لمضاعفة النتيجة
- Banner Ad (اختياري)

## التشغيل
بعد تثبيت Flutter:
```bash
flutter pub get
flutter run
```

## ملاحظة مهمة (لإنشاء مجلدات iOS/Android)
هذه الحزمة تركّز على الكود (lib/ + pubspec). إذا ما عندك مجلدات ios/android:
```bash
flutter create .
flutter pub get
flutter run
```

## إعداد AdMob (اختياري)
عدّل:
`lib/admob_ids.dart`

ثم على iOS:
- افتح `ios/Runner/Info.plist` وضع App ID الخاص بـ AdMob
- ثم:
```bash
cd ios
pod install
cd ..
flutter run
```

## نشر على iPhone (App Store)
تحتاج:
- جهاز Mac + Xcode
- حساب Apple Developer

ثم:
```bash
flutter build ios --release
```
ومن Xcode: Product > Archive ثم رفع App Store Connect.
