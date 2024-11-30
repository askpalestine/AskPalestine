import 'package:flutter/material.dart';
import 'package:mobile/models/question_model.dart';
import 'package:mobile/screens/question/answers_widget.dart';
import 'package:mobile/services/questions_service.dart';
import 'package:mobile/models/answer_model.dart';

class QuestionScreen extends StatefulWidget {
  final QuestionModel question;
  final Function onQuestionRead; // Define onQuestionRead function

  const QuestionScreen(
      {Key? key, required this.question, required this.onQuestionRead})
      : super(key: key);

  @override
  State<QuestionScreen> createState() => _QuestionScreenState();
}

class _QuestionScreenState extends State<QuestionScreen> {
  bool showFullQuestion = true;
  late Future<List<AnswerModel>> _answersFuture;

  @override
  void initState() {
    super.initState();
    _answersFuture = _fetchAnswers();
  }

  Future<List<AnswerModel>> _fetchAnswers() async {
    try {
      QuestionModel question =
          await QuestionsService.getQuestion(widget.question.id);
      return question.answers;
    } catch (e) {
      print(StackTrace.current);
      print(e);
      return [];
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.background,
        ),
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                children: [
                  ListTile(
                    title: Text(
                      widget.question.questionForms[0],
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize:
                            Theme.of(context).textTheme.bodyLarge?.fontSize,
                      ),
                      maxLines: showFullQuestion ? null : 1,
                      overflow: showFullQuestion
                          ? null
                          : TextOverflow
                              .ellipsis, // Show ellipsis if not expanded
                    ),
                    onTap: () {
                      setState(() {
                        showFullQuestion = !showFullQuestion;
                      });
                    },
                  ),
                  if (showFullQuestion)
                    ...widget.question.questionForms
                        .skip(1)
                        .map((form) => ListTile(
                              title: Text(
                                form,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: Theme.of(context)
                                      .textTheme
                                      .bodyLarge
                                      ?.fontSize,
                                ),
                              ),
                              onTap: () {
                                setState(() {
                                  showFullQuestion = !showFullQuestion;
                                });
                              },
                            )),
                ],
              ),
            ),
            FutureBuilder<List<AnswerModel>>(
              future: _answersFuture,
              initialData: const [], // Provide initial data to prevent rebuilding
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Text('Error: ${snapshot.error}');
                } else {
                  List<AnswerModel> answers = snapshot.data ?? [];
                  if (answers.length == 0) {
                    return const Center(
                      child: Text('No answers yet'),
                    );
                  }
                  return Expanded(
                    child: AnswersWidget(
                      question: widget.question,
                      answers: answers,
                      onQuestionRead: widget.onQuestionRead,
                      onAnswerRead: () => setState(() {
                        showFullQuestion = false;
                      }),
                    ),
                  );
                }
              },
            ),
          ],
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () {
            showDialog(
              context: context,
              builder: (context) {
                String answerText = '';
                bool isLoading = false;

                return StatefulBuilder(
                  builder: (context, setState) {
                    return AlertDialog(
                      title: const Text("Answer"),
                      content: TextField(
                        onChanged: (value) {
                          setState(() {
                            answerText = value;
                          });
                        },
                        decoration: const InputDecoration(
                          hintMaxLines: 100,
                          hintText:
                              "Add your answer along with sources (e.g. links to videos, articles, etc..). Please don't worry about formatting, we will take care of it.",
                        ),
                        expands: true,
                        maxLines: null,
                      ),
                      actions: [
                        if (isLoading)
                          const CircularProgressIndicator()
                        else
                          TextButton(
                            onPressed: () async {
                              setState(() {
                                isLoading = true;
                              });

                              // Call QuestionsService.createQuestion(text) here
                              QuestionsService.answerQuestion(
                                      widget.question.id, answerText)
                                  .then((_) {
                                setState(() {
                                  isLoading = false;
                                });

                                // Show success toast or message here
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: const Text(
                                        'Your answer has been submitted successfully! An admin will review it soon, format it, and add it.'),
                                    backgroundColor:
                                        Theme.of(context).colorScheme.primary,
                                  ),
                                );

                                Navigator.pop(context); // Close the dialog
                              }).catchError((e) {
                                setState(() {
                                  isLoading = false;
                                });

                                // Show error toast or message here
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content:
                                        const Text('Failed to submit answer'),
                                    backgroundColor:
                                        Theme.of(context).colorScheme.error,
                                  ),
                                );
                                Navigator.pop(context); // Close the dialog
                              });
                            },
                            child: const Text('Send'),
                          ),
                      ],
                    );
                  },
                );
              },
            );
          },
          child: const Icon(Icons.create),
        ),
      ),
    );
  }
}
