import 'package:flutter/material.dart';
import 'package:mobile/screens/home/question_widget.dart';

import '../../services/questions_service.dart';
import '../../services/read_tracker_service.dart';
import 'package:mobile/models/question_model.dart';

class AskQuestionScreen extends StatefulWidget {
  const AskQuestionScreen({super.key});

  @override
  State<AskQuestionScreen> createState() => _AskQuestionScreenState();
}

class _AskQuestionScreenState extends State<AskQuestionScreen> {
  List<QuestionModel> _questions = [];
  FocusNode _focusNode = FocusNode();
  bool _isSearching = false;
  String _searchText = "";
  bool _isSubmittingQuestion = false;

  @override
  void initState() {
    super.initState();
    _focusNode = FocusNode();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
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
              const Padding(padding: const EdgeInsets.only(top: 8.0)),
              Padding(
                padding: const EdgeInsets.only(left: 8.0, right: 8.0, top: 8.0),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Expanded(
                          child: TextField(
                            textAlign: TextAlign.center,
                            keyboardType: TextInputType.text,
                            maxLines: null,
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge
                                ?.copyWith(
                                  color:
                                      Theme.of(context).colorScheme.secondary,
                                ),
                            focusNode: _focusNode,
                            decoration: const InputDecoration(
                              hintText: 'Ask a Question',
                              border: InputBorder.none,
                            ),
                            onSubmitted: (value) async {
                              setState(() {
                                _searchText = value;
                              });
                              await _searchQuestions();
                            },
                            onChanged: (value) {
                              if (value.split(" ").length > 20) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                        'Questions should be at most 20 words long'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                              if (value.length > 300) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                        'Questions should be at most 300 characters long'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            },
                          ),
                        ),
                      ]),
                ),
              ),
              if (_isSearching)
                const Center(
                  child: CircularProgressIndicator(),
                ),
              Expanded(
                child: ListView.builder(
                  cacheExtent: 1000,
                  itemCount: _questions.length,
                  itemBuilder: (context, index) {
                    return QuestionWidget(
                      key: ValueKey(_questions[index].id),
                      question: _questions[index],
                      onQuestionRead: () {
                        setState(() {});
                      },
                    );
                  },
                ),
              ),
              if (problemWithSearchText() == null )
                Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: ElevatedButton(
                      onPressed: () {
                        if (_isSubmittingQuestion) {
                          return;
                        }
                        _submitQuestion();
                      },
                      child: _isSubmittingQuestion
                          ?  CircularProgressIndicator(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        color: Theme.of(context).colorScheme.primary,
                      )
                          : const Padding(
                              padding: EdgeInsets.all(8.0),
                              child: Text(
                                  "Couldn't find what you're looking for? Submit a new question!",
                                textAlign: TextAlign.center,
                              ),
                            ),
                    )),
            ],
          ),
        ),
      ),
    );
  }

  String? problemWithSearchText() {
    if (_searchText == null || _searchText.trim().split(" ").length < 3) {
      return 'Questions should be at least 3 words long';
    }
    if (_searchText.trim().split(" ").length > 20) {
      return 'Questions should be at most 20 words long';
    }
    if (_searchText.length > 300) {
      return 'Questions should be at most 300 characters long';
    }
    return null;
  }
  void _submitQuestion() async {
    showDialog(context: context, builder: (context){
      return AlertDialog(
        title: const Text('Are you sure you want to submit this question?'),
        content: Text(_searchText),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              setState(() {
                _isSubmittingQuestion = true;
              });

              QuestionsService.createQuestion(_searchText).then((_) {
                // Show success toast or message here
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text(
                        'Your question has been submitted successfully! An admin will review it soon.'),
                    backgroundColor: Theme.of(context).colorScheme.primary,
                  ),
                );

                Navigator.pop(context);
                Navigator.pop(context);
              }).catchError((e) {
                // Show error toast or message here
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Failed to submit question'),
                    backgroundColor: Theme.of(context).colorScheme.error,
                  ),
                );
                Navigator.pop(context); // Close the dialog
              });
            },
            child: const Text('Submit'),
          ),
        ],
      );
    });
  }

  Future<void> _searchQuestions() async {
    setState(() {
      _isSearching = true;
    });
    String? problem = problemWithSearchText();
    if (problem != null) {
      setState(() {
        _isSearching = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
         SnackBar(
          content: Text(problem),
          backgroundColor: Colors.red,
        ),
      );
      return Future.value();
    }


    try {
      GetQuestionsResponse getQuestionsResponse =
          await QuestionsService.searchQuestions(searchText: _searchText);
      final questions = getQuestionsResponse.questions;
      setState(() {
        _questions = questions;
        _isSearching = false;
      });
    } catch (e) {
      setState(() {
        _isSearching = false;
      });
      print(e);
    }
  }
}
