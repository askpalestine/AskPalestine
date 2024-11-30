import 'answer_model.dart'; // Import the AnswerModel

class QuestionModel {
  int id;
  List<String> questionForms;
  int viewsCount;
  List<AnswerModel> answers; // Use AnswerModel instead of Answer

  QuestionModel({
    required this.id,
    required this.questionForms,
    required this.viewsCount,
    required this.answers,
  });

  factory QuestionModel.fromJson(Map<String, dynamic> json) => QuestionModel(
    id: json["id"],
    questionForms: List<String>.from(json["question_forms"].map((x) => x)),
    viewsCount: json["views_count"],
    answers: List<AnswerModel>.from(json["answers"].map((x) => AnswerModel.fromJson(x))), // Use AnswerModel.fromJson
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "question_forms": List<dynamic>.from(questionForms.map((x) => x)),
    "views_count": viewsCount,
    "answers": List<dynamic>.from(answers.map((x) => x.toJson())), // Use AnswerModel.toJson
  };
}
