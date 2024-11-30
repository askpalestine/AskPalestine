import 'package:flutter/material.dart';
import 'package:mobile/models/question_model.dart';
import 'package:mobile/screens/question/question_screen.dart';
import 'package:mobile/screens/user/user_screen.dart';
import 'package:mobile/services/users_service.dart';
import 'package:mobile/services/read_tracker_service.dart';
import 'package:skeletonizer/skeletonizer.dart';

class QuestionWidget extends StatelessWidget {
  final QuestionModel question;
  final Function
      onQuestionRead; // Add the onQuestionRead function as a parameter

  const QuestionWidget(
      {Key? key, required this.question, required this.onQuestionRead})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ReadTrackerService>(
      future: ReadTrackerService.getInstance(),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          // Return a loading indicator or placeholder widget here
          return Text('Error: ${snapshot.error}');
        }
        final isQuestionRead =
            snapshot.data?.isQuestionRead(question.id) ?? false;
        return Skeletonizer(
            enabled: snapshot.connectionState == ConnectionState.waiting,
            child: question.answers.isEmpty
                ? getCard(context)
                : Banner(
                    message: (isQuestionRead ? 'Read' : 'Unread'),
                    color: isQuestionRead
                        ? Theme.of(context).primaryColor
                        : Theme.of(context).colorScheme.onError,
                    location: BannerLocation.topEnd,
                    child: getCard(context, isQuestionRead: isQuestionRead),
                  ));
      },
    );
  }

  Widget getCard(BuildContext context, {bool isQuestionRead = false}) {
    return Card(
      margin: const EdgeInsets.all(4.0),
      borderOnForeground: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10), // Add circular border radius
        side: BorderSide(
          color: isQuestionRead
              ? Theme.of(context).primaryColor
              : Theme.of(context).colorScheme.secondary,
          width: 5,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ...question.questionForms.map(
              (q) => Padding(
                padding: const EdgeInsets.all(8.0),
                // Add desired padding here
                child: Text(q, style: Theme.of(context).textTheme.titleMedium),
              ),
            ),
            const SizedBox(height: 10),
            ...question.answers
                .map((a) => a.submitter.username)
                .toSet()
                .toList()
                .map(
                  (username) => GestureDetector(
                    // Wrap the Row with GestureDetector
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => UserScreen(
                              username:
                                  username), // Pass the username to UserScreen
                        ),
                      );
                    },
                    child: Row(
                      children: [
                        // Replace with actual image widget if available
                        Padding(
                          padding: const EdgeInsets.all(
                              8.0), // Add desired padding here
                          child: CircleAvatar(
                            child: FutureBuilder(
                              future: UsersService.getPhoto(username),
                              builder: (context, snapshot) {
                                if (snapshot.connectionState ==
                                    ConnectionState.waiting) {
                                  return const CircleAvatar(
                                    child: Icon(Icons.person),
                                  );
                                } else if (snapshot.hasError) {
                                  return const CircleAvatar(
                                    child: Icon(Icons.error),
                                  );
                                } else {
                                  return CircleAvatar(
                                    backgroundImage:
                                        MemoryImage(snapshot.data!),
                                  );
                                }
                              },
                            ),
                          ),
                        ),
                        Text(username),
                      ],
                    ),
                  ),
                ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                children: [
                  const Icon(Icons.remove_red_eye),
                  Padding(
                    padding: const EdgeInsets.only(left: 8.0),
                    child: Text(question.viewsCount.toString()),
                  ),
                  const Spacer(), // Add Spacer widget here
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => QuestionScreen(
                              question: question,
                              onQuestionRead: onQuestionRead),
                        ),
                      );
                    },
                    child: question.answers.isEmpty
                        ? const Text('Add Answer')
                        : const Text('Read more'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
