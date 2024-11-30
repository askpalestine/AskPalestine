import 'user_model.dart';

class AnswerModel {
  int id;
  int questionId;
  int submitterId;
  UserModel submitter;
  int sharesCount;
  String? text;
  String? source;
  String? sourceType;

  AnswerModel({
    required this.id,
    required this.questionId,
    required this.submitterId,
    required this.submitter,
    required this.sharesCount,
    this.text,
    this.source,
    this.sourceType,
  });

  factory AnswerModel.fromJson(Map<String, dynamic> json) => AnswerModel(
    id: json["id"],
    questionId: json["question_id"],
    submitterId: json["submitter_id"],
    submitter: UserModel.fromJson(json["submitter"]),
    sharesCount: json["shares_count"],
    text: json["text"],
    source: json["source"],
    sourceType: json["source_type"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "question_id": questionId,
    "submitter_id": submitterId,
    "submitter": submitter.toJson(),
    "shares_count": sharesCount,
    if (text != null) "text": text,
    if (source != null) "source": source,
    if (sourceType != null) "source_type": sourceType,
  };
}
