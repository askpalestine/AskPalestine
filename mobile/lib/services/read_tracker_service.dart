import 'package:shared_preferences/shared_preferences.dart';

class ReadTrackerService {
  static ReadTrackerService? _instance;
  SharedPreferences _prefs;

  ReadTrackerService._({
    required SharedPreferences prefs,
  }) : _prefs = prefs;

  static Future<ReadTrackerService> getInstance() async {
    if (_instance == null) {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      _instance = ReadTrackerService._(prefs: prefs);
    }
    return _instance!;
  }

  void markQuestionAsRead(int questionId, {bool read = true}) {
    _prefs.setBool('question_$questionId', read);
  }

  void markAnswerAsRead(int answerId) {
    _prefs.setBool('answer_$answerId', true);
  }

  bool isQuestionRead(int questionId) {
    return _prefs.getBool('question_$questionId') ?? false;
  }

  bool isAnswerRead(int answerId) {
    return _prefs.getBool('answer_$answerId') ?? false;
  }
}
