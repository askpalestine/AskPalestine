import 'package:shared_preferences/shared_preferences.dart';

class OnboardingTrackerService {
  static OnboardingTrackerService? _instance;
  SharedPreferences _prefs;

  OnboardingTrackerService._({
    required SharedPreferences prefs,
  }) : _prefs = prefs;

  static Future<OnboardingTrackerService> getInstance() async {
    if (_instance == null) {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      _instance = OnboardingTrackerService._(prefs: prefs);
    }
    return _instance!;
  }

  void markOnboardingDone() {
    _prefs.setBool('onboarding_done', true);
  }

  bool isOnboardingDone() {
    return _prefs.getBool('onboarding_done') ?? false;
  }
}
