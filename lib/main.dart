import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'admob_ids.dart';
import 'theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await MobileAds.instance.initialize();
  runApp(const SaudiTapApp());
}

class SaudiTapApp extends StatelessWidget {
  const SaudiTapApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'تحدي النقر السعودي',
      theme: AppTheme.theme(),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int best = 0;
  BannerAd? _banner;

  @override
  void initState() {
    super.initState();
    _loadBest();
    _loadBanner();
  }

  Future<void> _loadBest() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() => best = prefs.getInt('best') ?? 0);
  }

  void _loadBanner() {
    _banner = BannerAd(
      adUnitId: AdmobIds.bannerUnitId,
      request: const AdRequest(),
      size: AdSize.banner,
      listener: BannerAdListener(
        onAdFailedToLoad: (ad, err) {
          ad.dispose();
          setState(() => _banner = null);
        },
      ),
    )..load();
  }

  @override
  void dispose() {
    _banner?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تحدي النقر السعودي 🇸🇦'), centerTitle: true),
      body: Column(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('أفضل نتيجة: $best', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 10),
                  const Text('اضغط أكبر عدد ممكن خلال 10 ثواني.\nبعدها تقدر تشوف إعلان مكافأة لمضاعفة النتيجة.',
                      textAlign: TextAlign.center),
                  const SizedBox(height: 24),
                  FilledButton.icon(
                    onPressed: () async {
                      final result = await Navigator.of(context).push<int>(
                        MaterialPageRoute(builder: (_) => const GameScreen()),
                      );
                      if (result != null && result > best) {
                        final prefs = await SharedPreferences.getInstance();
                        await prefs.setInt('best', result);
                        setState(() => best = result);
                      }
                    },
                    icon: const Icon(Icons.play_arrow),
                    label: const Text('ابدأ اللعب'),
                  ),
                ],
              ),
            ),
          ),
          if (_banner != null)
            SafeArea(
              child: SizedBox(
                height: _banner!.size.height.toDouble(),
                width: _banner!.size.width.toDouble(),
                child: AdWidget(ad: _banner!),
              ),
            ),
        ],
      ),
    );
  }
}

class GameScreen extends StatefulWidget {
  const GameScreen({super.key});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  static const int gameSeconds = 10;

  int taps = 0;
  int secondsLeft = gameSeconds;
  bool running = false;
  bool finished = false;

  Timer? _timer;

  RewardedAd? _rewarded;
  bool _rewardedReady = false;
  bool _loadingRewarded = false;

  @override
  void initState() {
    super.initState();
    _start();
    _loadRewarded();
  }

  void _start() {
    running = true;
    finished = false;
    taps = 0;
    secondsLeft = gameSeconds;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (secondsLeft <= 1) {
        t.cancel();
        setState(() {
          secondsLeft = 0;
          running = false;
          finished = true;
        });
      } else {
        setState(() => secondsLeft--);
      }
    });
  }

  void _loadRewarded() {
    if (_loadingRewarded) return;
    _loadingRewarded = true;

    RewardedAd.load(
      adUnitId: AdmobIds.rewardedUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          _rewarded = ad;
          _rewardedReady = true;
          _loadingRewarded = false;
          ad.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              _rewarded = null;
              _rewardedReady = false;
              _loadRewarded();
            },
            onAdFailedToShowFullScreenContent: (ad, err) {
              ad.dispose();
              _rewarded = null;
              _rewardedReady = false;
              _loadRewarded();
            },
          );
          if (mounted) setState(() {});
        },
        onAdFailedToLoad: (err) {
          _rewarded = null;
          _rewardedReady = false;
          _loadingRewarded = false;
          if (mounted) setState(() {});
        },
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    _rewarded?.dispose();
    super.dispose();
  }

  void _tap() {
    if (!running) return;
    setState(() => taps++);
  }

  Future<void> _finish(int finalScore) async {
    if (!mounted) return;
    Navigator.of(context).pop<int>(finalScore);
  }

  void _watchRewardedToDouble() {
    if (!_rewardedReady || _rewarded == null) return;
    _rewarded!.show(onUserEarnedReward: (ad, reward) async {
      await _finish(taps * 2);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('اللعبة'), centerTitle: true),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _StatCard(title: 'الوقت', value: '$secondsLeft ث'),
                _StatCard(title: 'النقرات', value: '$taps'),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: GestureDetector(
                onTap: _tap,
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    gradient: LinearGradient(
                      colors: [
                        Theme.of(context).colorScheme.primary.withOpacity(0.85),
                        Theme.of(context).colorScheme.secondary.withOpacity(0.65),
                      ],
                      begin: Alignment.topRight,
                      end: Alignment.bottomLeft,
                    ),
                  ),
                  child: const Center(
                    child: Text('اضغط هنا!', style: TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w900)),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (finished) ...[
              Text('نتيجتك: $taps', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: FilledButton(
                      onPressed: () => _finish(taps),
                      child: const Text('حفظ النتيجة'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _rewardedReady ? _watchRewardedToDouble : null,
                      child: Text(_rewardedReady ? 'شاهد إعلان ×2' : 'إعلان غير متاح'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              TextButton.icon(
                onPressed: () => setState(() => _start()),
                icon: const Icon(Icons.refresh),
                label: const Text('إعادة اللعب'),
              ),
            ] else ...[
              FilledButton.icon(
                onPressed: () => setState(() => _start()),
                icon: const Icon(Icons.refresh),
                label: const Text('ابدأ من جديد'),
              ),
            ]
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  const _StatCard({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: (MediaQuery.of(context).size.width - 48) / 2,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [BoxShadow(blurRadius: 10, color: Color(0x11000000), offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}
