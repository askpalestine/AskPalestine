import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:mobile/models/question_model.dart';
import 'package:mobile/models/user_model.dart';
import 'package:mobile/screens/question/question_screen.dart';
import 'package:mobile/services/questions_service.dart';
import 'package:mobile/services/users_service.dart';
import 'dart:typed_data';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:mobile/utils/markdown_util.dart';
import 'package:url_launcher/url_launcher.dart';

class UserScreen extends StatelessWidget {
  final String username;

  const UserScreen({super.key, required this.username});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.background,
        ),
        body: Padding(
          padding: const EdgeInsets.all(8.0),
          child: SingleChildScrollView(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    username,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
                FutureBuilder<Uint8List>(
                  future: UsersService.getPhoto(username),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const CircleAvatar(
                        child: Icon(Icons.person),
                      );
                    } else if (snapshot.hasError) {
                      return const CircleAvatar(
                        child: Icon(Icons.error),
                      );
                    } else {
                      return CircleAvatar(
                        backgroundImage: MemoryImage(snapshot.data!),
                        radius: 100, // Increase the radius to make it bigger
                      );
                    }
                  },
                ),
                const Padding(padding: EdgeInsets.all(8.0)),
                FutureBuilder<UserModel>(
                  future: UsersService.getUser(username),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const CircularProgressIndicator();
                    } else if (snapshot.hasError) {
                      return Text('Error: ${snapshot.error}');
                    } else {
                      UserModel user = snapshot.data!;
                      return Column(
                        children: [
                          MarkdownBody(
                            data: MarkdownUtil.preprocessText(user.bio!),
                            onTapLink: (_, href, __) {
                              launchUrl(Uri.parse(href!));
                            },
                          ),
                        ],
                      );
                    }
                  },
                ),
                const Padding(padding: EdgeInsets.all(8.0)),
                Text(
                  'Answered Questions',
                  style: TextStyle(
                      fontSize:
                          Theme.of(context).textTheme.headlineMedium?.fontSize),
                ),
                FutureBuilder<GetQuestionsResponse>(
                  future: QuestionsService.getUserQuestions(username),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const CircularProgressIndicator();
                    } else if (snapshot.hasError) {
                      return Text('Error: ${snapshot.error}');
                    } else {
                      List<QuestionModel> questions = snapshot.data!.questions;
                      return Column(
                        children: [
                          if (snapshot.data!.isHidingQuestions)
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
                          if (questions.isEmpty)
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
                          ...questions
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
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            if (question.questionForms.length >
                                                1)
                                              Text(
                                                'Related Questions',
                                                style: TextStyle(
                                                  color: Theme.of(context)
                                                      .primaryColor,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ...question.questionForms
                                                .asMap()
                                                .entries
                                                .map(
                                              (entry) {
                                                final form = entry.value;
                                                final index = entry.key;
                                                return Column(
                                                  children: [
                                                    Text(
                                                      form,
                                                      textAlign: TextAlign.left,
                                                    ),
                                                    if (index !=
                                                        question.questionForms
                                                                .length -
                                                            1)
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
                              .toList(),
                        ],
                      );
                    }
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
