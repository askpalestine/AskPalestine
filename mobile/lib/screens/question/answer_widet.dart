import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:mobile/models/answer_model.dart'; // Replace with your actual path
import 'package:mobile/models/question_model.dart';
import 'package:mobile/screens/user/user_screen.dart';
import 'package:mobile/services/questions_service.dart';
import 'package:mobile/services/read_tracker_service.dart'; // Replace with your actual path
import 'package:mobile/services/users_service.dart'; // Replace with your actual path
import 'package:mobile/utils/markdown_util.dart'; // Replace with your actual path
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

class AnswerWidget extends StatefulWidget {
  final AnswerModel answer;
  final QuestionModel question;
  final Function() onAnswerRead; // Add this line

  const AnswerWidget({
    Key? key,
    required this.answer,
    required this.onAnswerRead, // Add this line
    required this.question,
  }) : super(key: key);

  @override
  State<AnswerWidget> createState() => _AnswerWidgetState();
}

class _AnswerWidgetState extends State<AnswerWidget> {
  bool isExpanded = false;

  late Future<ReadTrackerService> _readTrackerServiceFuture; // Add this line
  late YoutubePlayerController _youtubePlayerController;

  @override
  void initState() {
    super.initState();
    _readTrackerServiceFuture =
        ReadTrackerService.getInstance(); // Add this line

  }

  bool isYoutubeSource(AnswerModel answer) {
    return answer?.source?.contains('youtube.com/embed') ?? false;
  }

  String getYoutubeVideoId(String url) {
    final RegExp videoIdRegex = RegExp(r'embed/([a-zA-Z0-9_-]+)');
    final match = videoIdRegex.firstMatch(url);

    if (match != null) {
      return match.group(1)!; // Return the video I
    } else {
      throw const FormatException('Invalid YouTube embed URL');
    }
  }

  int getYoutubeVideoStartTime(String url) {
    final RegExp startTimeRegex = RegExp(r'&start=(\d+)');
    final match = startTimeRegex.firstMatch(url);

    if (match != null) {
      return int.tryParse(match.group(1)!) ?? 0;
    } else {
      return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ReadTrackerService>(
        future: _readTrackerServiceFuture,
        initialData: null,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const CircularProgressIndicator();
          } else if (snapshot.hasError) {
            return Text('Error: ${snapshot.error}');
          } else {
            ReadTrackerService tracker = snapshot.data!;
            bool isAnswerRead = tracker.isAnswerRead(widget.answer.id);
            if (isYoutubeSource(widget.answer)) {
              _youtubePlayerController = YoutubePlayerController(
                initialVideoId: getYoutubeVideoId(
                    widget.answer.source!),
                flags: YoutubePlayerFlags(
                  hideControls: false,
                  controlsVisibleAtStart: true,
                  autoPlay: false,
                  mute: false,
                  startAt: getYoutubeVideoStartTime(
                      widget.answer.source!),
                ),
              );
            }
            return Padding(
              padding: const EdgeInsets.only(
                left: 8.0,
                right: 8.0,
                bottom: 8.0,
              ),
              child: Banner(
                message: isAnswerRead ? 'Read' : 'Unread',
                color: isAnswerRead
                    ? Theme
                    .of(context)
                    .primaryColor
                    : Theme
                    .of(context)
                    .colorScheme
                    .onError,
                location: BannerLocation.topEnd,
                child: Card(
                  shape: RoundedRectangleBorder(
                    borderRadius:
                    BorderRadius.circular(10), // Add circular border radius
                    side: BorderSide(
                      color: isAnswerRead
                          ? Theme
                          .of(context)
                          .primaryColor
                          : Theme
                          .of(context)
                          .colorScheme
                          .onError,
                      width: 3,
                    ),
                  ),
                  child: Theme(
                    data: Theme.of(context)
                        .copyWith(dividerColor: Colors.transparent),
                    child: SingleChildScrollView(
                      child: ExpansionTile(
                        initiallyExpanded: isExpanded,
                        title: Row(
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            // Replace with actual image widget if available
                            Padding(
                              padding: const EdgeInsets.all(
                                  8.0), // Add desired padding here
                              child: CircleAvatar(
                                child: FutureBuilder(
                                  future: UsersService.getPhoto(
                                      widget.answer.submitter.username),
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
                            Expanded(
                                child: Text(
                                  widget.answer.submitter.username,
                                )),
                          ],
                        ),
                        children: [
                          if (isYoutubeSource(widget.answer))
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Container(
                                height: 250,
                                // Adjust the height of the WebView
                                child: YoutubePlayer(
                                  controller: _youtubePlayerController,
                                  showVideoProgressIndicator: true,
                                  progressIndicatorColor: Colors.amber,
                                  progressColors: const ProgressBarColors(
                                    playedColor: Colors.amber,
                                    handleColor: Colors.amberAccent,
                                  ),
                                ),
                              ),
                            ),
                          ListTile(
                            title: MarkdownBody(
                              data: MarkdownUtil.preprocessText(
                                  widget.answer.text!),
                              onTapLink: (_, href, __) {
                                launchUrl(Uri.parse(href!));
                              },
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.only(
                                top: 4.0, left: 8.0, right: 8.0),
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Text("Share Answer"),
                                      Padding(
                                        padding:
                                        const EdgeInsets.only(left: 8.0),
                                        child: GestureDetector(
                                          child: const Icon(
                                            Icons.share,
                                            size: 20,
                                          ),
                                          onTap: () {
                                            Share.share(
                                                '${widget.question
                                                    .questionForms[0]}\nCheck out this answer by ${widget
                                                    .answer.submitter
                                                    .username} on AskPalestine: https://askpalestine.info/qa/${widget
                                                    .answer.questionId}');
                                          },
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Padding(
                                      padding: const EdgeInsets.only(top: 8.0)),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Text("Report Answer"),
                                      Padding(
                                        padding:
                                        const EdgeInsets.only(left: 8.0),
                                        child: GestureDetector(
                                          child: const Icon(
                                            Icons.flag,
                                            size: 20,
                                          ),
                                          onTap: () {
                                            showDialog(
                                              context: context,
                                              builder: (context) {
                                                String reportText = '';
                                                bool isLoading = false;

                                                return StatefulBuilder(
                                                  builder: (context, setState) {
                                                    return AlertDialog(
                                                      title: const Text(
                                                          'Enter your report message'),
                                                      content: TextField(
                                                        onChanged: (value) {
                                                          setState(() {
                                                            reportText = value;
                                                          });
                                                        },
                                                        decoration:
                                                        const InputDecoration(
                                                          hintText: 'Report',
                                                        ),
                                                      ),
                                                      actions: [
                                                        if (isLoading)
                                                          const CircularProgressIndicator()
                                                        else
                                                          TextButton(
                                                            onPressed:
                                                                () async {
                                                              setState(() {
                                                                isLoading =
                                                                true;
                                                              });

                                                              // Call QuestionsService.createQuestion(text) here
                                                              QuestionsService
                                                                  .reportAnswer(
                                                                  widget
                                                                      .answer
                                                                      .id,
                                                                  reportText)
                                                                  .then((_) {
                                                                setState(() {
                                                                  isLoading =
                                                                  false;
                                                                });

                                                                // Show success toast or message here
                                                                ScaffoldMessenger
                                                                    .of(
                                                                    context)
                                                                    .showSnackBar(
                                                                  SnackBar(
                                                                    content:
                                                                    const Text(
                                                                        'Your report has been submitted successfully! An admin will review it soon.'),
                                                                    backgroundColor: Theme
                                                                        .of(
                                                                        context)
                                                                        .colorScheme
                                                                        .primary,
                                                                  ),
                                                                );

                                                                Navigator.pop(
                                                                    context); // Close the dialog
                                                              }).catchError(
                                                                      (e) {
                                                                    setState(() {
                                                                      isLoading =
                                                                      false;
                                                                    });

                                                                    // Show error toast or message here
                                                                    ScaffoldMessenger
                                                                        .of(
                                                                        context)
                                                                        .showSnackBar(
                                                                      SnackBar(
                                                                        content:
                                                                        const Text(
                                                                            'Failed to report answer'),
                                                                        backgroundColor: Theme
                                                                            .of(
                                                                            context)
                                                                            .colorScheme
                                                                            .error,
                                                                      ),
                                                                    );
                                                                    Navigator
                                                                        .pop(
                                                                        context); // Close the dialog
                                                                  });
                                                            },
                                                            child: const Text(
                                                                'Send'),
                                                          ),
                                                      ],
                                                    );
                                                  },
                                                );
                                              },
                                            );
                                          },
                                        ),
                                      ),
                                    ],
                                  )
                                ]),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: ElevatedButton(
                                onPressed: () =>
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            UserScreen(
                                              username:
                                              widget.answer.submitter.username,
                                            ),
                                      ),
                                    ),
                                child: Padding(
                                  padding: const EdgeInsets.all(4.0),
                                  child: Text(
                                    'More answers from ${widget.answer.submitter
                                        .username}',
                                    textAlign: TextAlign.center,
                                  ),
                                )),
                          )
                        ],
                        onExpansionChanged: (expanded) {
                          if (expanded) {
                            setState(() {
                              tracker.markAnswerAsRead(widget.answer.id);
                              widget.onAnswerRead();
                              isExpanded = true;
                            });
                          } else {
                            setState(() {
                              isExpanded = false;
                            });
                          }
                        },
                      ),
                    ),
                  ),
                ),
              ),
            );
          }
        });
  }
}
