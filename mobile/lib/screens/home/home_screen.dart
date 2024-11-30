import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:mobile/models/question_model.dart';
import 'package:mobile/screens/ask/AskQuestionScreen.dart';
import 'package:mobile/screens/question/question_screen.dart';
import 'package:mobile/services/questions_service.dart';
import 'package:mobile/screens/home/question_widget.dart';
import 'package:mobile/services/read_tracker_service.dart';
import 'package:url_launcher/url_launcher.dart';

class HomeScreen extends StatefulWidget {
  QuestionModel? notificationQuestion;

  HomeScreen({Key? key, this.notificationQuestion}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late List<QuestionModel> _answeredQuestions;
  late List<QuestionModel> _unansweredQuestions;
  bool pushedQuestion = false;
  bool _isHidingQuestions = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _answeredQuestions = [];
    _unansweredQuestions = [];
    _fetchQuestions();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (widget.notificationQuestion != null && !pushedQuestion) {
      pushedQuestion = true;

      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => QuestionScreen(
              question: widget.notificationQuestion!,
              onQuestionRead: () {
                setState(() {});
              },
            ),
          ),
        );
      });
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchQuestions({String? filterText}) async {
    try {
      final readTrackerService = await ReadTrackerService.getInstance();
      GetQuestionsResponse getQuestionsResponse =
          await QuestionsService.getQuestions(
              filterText: filterText == '' ? null : filterText);
      final questions = getQuestionsResponse.questions;
      questions.forEach((question) {
        int readAnswersCount = question.answers
            .where((answer) => readTrackerService.isAnswerRead(answer.id))
            .length;
        readTrackerService.markQuestionAsRead(question.id,
            read: readAnswersCount == question.answers.length);
      });
      setState(() {
        _isHidingQuestions = getQuestionsResponse.isHidingQuestions;
        _answeredQuestions =
            questions.where((question) => question.answers.isNotEmpty).toList()
              ..sort((a, b) {
                bool aRead = readTrackerService.isQuestionRead(a.id);
                bool bRead = readTrackerService.isQuestionRead(b.id);
                if (aRead && !bRead) {
                  return 1;
                } else if (!aRead && bRead) {
                  return -1;
                } else if (a.viewsCount == b.viewsCount) {
                  return a.id.compareTo(b.id);
                } else {
                  return b.viewsCount.compareTo(a.viewsCount);
                }
              });
        _unansweredQuestions =
            questions.where((question) => question.answers.isEmpty).toList();
      });
    } catch (e) {
      print(e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: GestureDetector(
          onTap: () {
            FocusScope.of(context).unfocus();
          },
          child: Column(
            children: [
              const Padding(padding: const EdgeInsets.only(top: 16.0)),
              TabBar(
                controller: _tabController,
                overlayColor: MaterialStateProperty.all<Color>(Colors.black),
                tabs: [
                  if (_answeredQuestions.isEmpty)
                    const Tab(text: 'Answered (?)')
                  else
                    Tab(text: 'Answered (${_answeredQuestions.length})'),
                  if (_answeredQuestions.isEmpty)
                    const Tab(text: 'Unanswered (?)')
                  else
                    Tab(text: 'Unanswered (${_unansweredQuestions.length})'),
                ],
                dividerColor: Theme.of(context).colorScheme.background,
              ),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    RefreshIndicator(
                      onRefresh: _fetchQuestions,
                      child: Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Column(
                          children: [
                            if (_isHidingQuestions)
                              Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: RichText(
                                  textAlign: TextAlign.center,
                                  text: TextSpan(
                                    text:
                                        "Some questions are currently hidden because of Google Play's new \"Sensitive Events\" policy. Go to ",
                                    style: TextStyle(
                                      color:
                                          Theme.of(context).colorScheme.error,
                                    ),
                                    children: [
                                      TextSpan(
                                        text: 'AskPalestine',
                                        style: const TextStyle(
                                          decoration: TextDecoration.underline,
                                        ),
                                        recognizer: TapGestureRecognizer()
                                          ..onTap = () {
                                            launchUrl(Uri.parse(
                                                'https://askpalestine.info'));
                                          },
                                      ),
                                      const TextSpan(
                                        text:
                                            ' website to view all the questions.',
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            if (_answeredQuestions.isEmpty)
                              const Padding(
                                padding: const EdgeInsets.all(32.0),
                                child:
                                    Center(child: CircularProgressIndicator()),
                              )
                            else
                              Expanded(
                                child: ListView.builder(
                                  cacheExtent: 1000,
                                  itemCount: _answeredQuestions.length,
                                  itemBuilder: (context, index) {
                                    return QuestionWidget(
                                      key: ValueKey(
                                          _answeredQuestions[index].id),
                                      question: _answeredQuestions[index],
                                      onQuestionRead: () {
                                        setState(() {});
                                      },
                                    );
                                  },
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                    RefreshIndicator(
                      onRefresh: _fetchQuestions,
                      child: Column(
                        children: [
                          if (_isHidingQuestions)
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: RichText(
                                textAlign: TextAlign.center,
                                text: TextSpan(
                                  text:
                                      "Some questions are currently hidden because of Google Play's policy. Go to ",
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.error,
                                  ),
                                  children: [
                                    TextSpan(
                                      text: 'AskPalestine',
                                      style: const TextStyle(
                                        decoration: TextDecoration.underline,
                                      ),
                                      recognizer: TapGestureRecognizer()
                                        ..onTap = () {
                                          launchUrl(Uri.parse(
                                              'https://askpalestine.info'));
                                        },
                                    ),
                                    const TextSpan(
                                      text:
                                          ' website to view all the questions.',
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          if (_unansweredQuestions.isEmpty &&
                              _answeredQuestions.isNotEmpty)
                            Expanded(
                              child: Center(
                                child: Text(
                                  'No unanswered questions',
                                  style: TextStyle(
                                    color: Theme.of(context)
                                        .colorScheme
                                        .onBackground
                                        .withOpacity(0.5),
                                  ),
                                ),
                              ),
                            ),
                          if (_answeredQuestions.isEmpty)
                            const Padding(
                              padding: EdgeInsets.all(32.0),
                              child: Center(child: CircularProgressIndicator()),
                            )
                          else
                            Expanded(
                              child: ListView.builder(
                                itemCount: _unansweredQuestions.length,
                                itemBuilder: (context, index) {
                                  return QuestionWidget(
                                    question: _unansweredQuestions[index],
                                    onQuestionRead: () {
                                      setState(() {});
                                    },
                                  );
                                },
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const AskQuestionScreen(),
              ),
            );
          },
          child: const Icon(Icons.search),
        ),
      ),
    );
  }

  List<Widget> similarQuestionsBeforeSubmitting(List<QuestionModel> questions) {
    return questions
        .map(
          (question) => GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => QuestionScreen(
                    question: question,
                    onQuestionRead: () {},
                  ),
                ),
              );
            },
            child: Container(
              width: double.infinity,
              child: Card(
                borderOnForeground: true,
                shape: RoundedRectangleBorder(
                  side: BorderSide(
                    color: Theme.of(context).primaryColor,
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ...question.questionForms.asMap().entries.map(
                        (entry) {
                          final form = entry.value;
                          final index = entry.key;
                          return Column(
                            children: [
                              Text(
                                form,
                                textAlign: TextAlign.left,
                              ),
                              if (index != question.questionForms.length - 1)
                                const SizedBox(height: 8),
                            ],
                          );
                        },
                      ).toList(),
                    ],
                  ),
                ),
              ),
            ),
          ),
        )
        .toList();
  }
}
