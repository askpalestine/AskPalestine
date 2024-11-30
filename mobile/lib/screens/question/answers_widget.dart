import 'package:flutter/material.dart';
import 'package:mobile/models/answer_model.dart';
import 'package:mobile/models/question_model.dart';
import 'package:mobile/screens/question/answer_widet.dart';
import 'package:mobile/services/read_tracker_service.dart';

class AnswersWidget extends StatefulWidget {
  final List<AnswerModel> answers;
  final QuestionModel question;
  final Function onQuestionRead; // Add this line
  final Function onAnswerRead;

  const AnswersWidget(
      {Key? key,
      required this.answers,
      required this.question,
      required this.onQuestionRead,
      required this.onAnswerRead}) // Update this line
      : super(key: key);

  @override
  State<AnswersWidget> createState() => _AnswersWidgetState();
}

class _AnswersWidgetState extends State<AnswersWidget> {
  Set<int> readAnswers = {};

  @override
  void initState() {
    super.initState();

    widget.answers.sort((a, b) => b.sharesCount.compareTo(a.sharesCount));

    ReadTrackerService.getInstance().then((readTrackerService) {
      if (widget.answers.isEmpty) {
        readTrackerService.markQuestionAsRead(widget.question.id);
        widget.onQuestionRead(); // Call the onQuestionRead function
      } else {
        for (AnswerModel answer in widget.answers) {
          if (readTrackerService.isAnswerRead(answer.id)) {
            readAnswers.add(answer.id);
          }
        }
      }
    });
  }

  void markAnswerAsRead(int answerId) {
    readAnswers.add(answerId);

    if (readAnswers.length == widget.answers.length) {
      ReadTrackerService.getInstance().then((readTrackerService) {
        readTrackerService.markQuestionAsRead(widget.question.id);
        widget.onQuestionRead(); // Call the onQuestionRead function
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: widget.answers.length,
      shrinkWrap: true,
      itemBuilder: (context, index) {
        AnswerModel answer = widget.answers[index];
        return AnswerWidget(
          question: widget.question,
          answer: answer,
          onAnswerRead: () {
            markAnswerAsRead(answer.id);
            widget.onAnswerRead();
          },
        );
      },
    );
  }
}
