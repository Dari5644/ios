import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData theme() {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0B6E4F)),
      scaffoldBackgroundColor: const Color(0xFFF7F7F7),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(fontWeight: FontWeight.w800),
        titleLarge: TextStyle(fontWeight: FontWeight.w700),
      ),
    );
  }
}
