import styles from "../../../styles/QnA.module.css";
import detailedStyles from "../../../styles/DetailedQnA.module.css";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import { useEffect, useRef, useState } from "react";
import Card from "../../../components/Card/Card";
import { fetchData, putData, submitData } from "../../../utils/dataRequests";
import ActionButton from "../../../components/ActionButton/ActionButton";
import { useRouter } from "next/router";
import { Question } from "../../../interfaces/qa.interface";
import Loading from "../../../components/Loading/Loading";
import { HeartFilledIcon, HeartOutlinedIcon, PlaneIcon } from "../../../assets/svgs";
import TextField from "../../../components/TextField/TextField";
import IconButton from "@/components/IconButton/IconButton";
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import actionButtonStyles from '@/components/ActionButton/ActionButton.module.css';
import Link from "next/link";
import Head from 'next/head';


import useAuthStatus from "@/hooks/useAuthStatus";
import Answer from "@/components/Answer/Answer";

export const ExpertDetailedQnA = (props) => {
    const userAnswerRef = useRef<HTMLInputElement>()
    const router = useRouter()
    const { isAuthenticated, authToken } = useAuthStatus();
    const [brokenImages, setBrokenImages] = useState(new Set<string>());


    const [userAnswer, setUserAnswer] = useState("");
    const [QnA, setQnA] = useState<Question>();
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    const [questionLiked, setQuestionLiked] = useState<boolean>(false);
    const [answerSubmitted, setAnswerSubmitted] = useState<number>(0);
    const [processedAnswers, setProcessedAnswers] = useState([]);
    const [markdownPreview, setMarkdownPreview] = useState('');
    const [isAddingAnswer, setIsAddingAnswer] = useState<boolean>(false);

    const handleImageError = (username) => {
        setBrokenImages((prevBrokenImages) => new Set([...prevBrokenImages, username]));
    };
    const submitAnswer = async () => {
        if (userAnswerRef.current.value.length == 0) {
            toast.error("Please enter an answer")
            return;
        }
        let body = {
            "text": userAnswerRef.current.value
        }
        try {
            if (isAuthenticated) {
                await submitData(`${baseUrl}/questions/${router.query.id}/answer/`, body, authToken)
            } else {
                await submitData(`${baseUrl}/questions/${router.query.id}/answer/unverified`, body)
            }
            userAnswerRef.current.value = ""
            setUserAnswer("")
            setMarkdownPreview("")
        } catch {
            toast.error("Error submitting answer")
            return;
        }
        setAnswerSubmitted(answerSubmitted + 1)
        if (isAuthenticated) {
            toast.success("Answer added successfully!")
        } else {
            toast.success("Answer submitted successfully! We will review it and add it soon. Subscribe to get notified when it is added.", { autoClose: 6000 })
        }
    }

    const processAnswers = async (answers) => {
        const sortedAnswers = answers.sort((a, b) => b.shares_count - a.shares_count);

        const processed = await Promise.all(sortedAnswers.map(async (answer) => {
            const html = await convertMarkdownToHtml(answer.text);
            return { ...answer, processedHtml: html };
        }));
        setProcessedAnswers(processed);
    };
    const getQuestion = async () => {
        let question = await fetchData(`${baseUrl}/questions/${router.query.id}/?is_expert=true`, authToken);
        setQnA(question);
        processAnswers(question.answers);
    };


    useEffect(() => {
        const { shareId, sharedAnswerId } = router.query;

        if (shareId) {
            const shareAnswer = async () => {
                try {
                    const response = await putData(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/answers/${sharedAnswerId}/shared/?share_id=${shareId}`, {}, authToken);
                } catch (error) {
                    console.error("Error counting share in backend", error);
                }
            };

            // Call the function to send the PUT request to the backend
            shareAnswer();
        }
    }, [router.query]);
    const convertMarkdownToHtml = async (markdownText) => {
        try {
            const processedContent = await remark()
                .use(remarkHtml)
                .process(markdownText);
            const sanitizedHtml = DOMPurify.sanitize(processedContent.toString());
            return sanitizedHtml;
        } catch (error) {
            console.error('Error processing markdown', error);
            return '';
        }
    };
    useEffect(() => {
        getQuestion();
    }, [questionLiked, answerSubmitted, router.query.id]);




    const handleAnswerChange = async () => {
        setUserAnswer(userAnswerRef.current.value)
        const html = await convertMarkdownToHtml(userAnswerRef.current.value);
        setMarkdownPreview(html);
    };


    return <div className={styles.container}>
        <Head>
            <title>{props.questionText}</title>
            <meta name="description" content="Check answers on AskPalestine website. AskPalestine is for every pro-Palestinian to read and share answers that show the truth while not falling into the traps of misleading narratives. AskPalestine is there to give you the strength to speak up with confidence. Together, we'll make our voices heard."></meta>
            <meta name="author" content="AskPalestine Team"></meta>

            <meta property="og:type" content="website"></meta>
            <meta property="og:url" content={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_HTTP_URL}/qa/${props.questionId}`}></meta>
            <meta property="og:title" content={props.questionText}></meta>
            <meta property="og:description" content="Check answers on AskPalestine website. AskPalestine is for every pro-Palestinian to read and share answers that show the truth while not falling into the traps of misleading narratives. AskPalestine is there to give you the strength to speak up with confidence. Together, we'll make our voices heard."></meta>
            <meta property="og:image" content={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_HTTP_URL}/favicon.png`}></meta>

            <meta name="twitter:site" content="@askpalestine_qa"></meta>
            <meta name="twitter:title" content={props.questionText}></meta>
            <meta name="twitter:description" content="Check answers on AskPalestine website. AskPalestine is for every pro-Palestinian to read and share answers that show the truth while not falling into the traps of misleading narratives. AskPalestine is there to give you the strength to speak up with confidence. Together, we'll make our voices heard."></meta>
            <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_HTTP_URL}/favicon.png`}></meta>
        </Head>
        {!QnA && <Loading />}
        {QnA && <div>

            <ToastContainer></ToastContainer>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', paddingBottom: '20px' }}>
                    <Link href="/" style={{ color: 'blue' }}><u>Home</u></Link>
                    <p>{"/"}</p>
                    <Link href="/qa" style={{ color: 'blue' }}><u>Q & A</u></Link>
                    <p>{"/"}</p>
                    <p>Question {router.query.id}</p>
                </div>
            <h2 style={{ textAlign: 'center', color: 'black', paddingBottom: '16px' }}>Questions</h2>

            <Card className={styles.breadCrumbsCardContainer}>
                <h3 style={{ color: 'black', textAlign: 'center' }}>
                    {QnA["question_forms"].map((form, index) => (
                        <div key={index} style={{ whiteSpace: 'pre-wrap', paddingBottom: index != QnA["question_forms"].length - 1 ? '16px': '0px' }}>
                            {form}
                        </div>
                    ))}
                </h3>
            </Card>
            <h2 style={{ textAlign: 'center', paddingBottom: '16px' }}>Answers</h2>
            <div className={detailedStyles.subCardContainer}>

                <div className={detailedStyles.subCardContainer}>
                    {(!QnA["answers"] || QnA["answers"].length == 0) && <p style={{ textAlign: 'center' }}>No answers have been added yet. Please write an answer along with its sources and we will verify it and post it here.</p>}

                    {processedAnswers && processedAnswers.map((answer, i) => (
                        <Answer key={i} questionText={QnA["question_forms"].join("\n")} answer={answer} />
                    ))}
                </div>
            </div>
            {isAuthenticated && isAddingAnswer &&
                <Card className={styles.cardAnswerContainerInput} style={{}}>
                    <div className={detailedStyles.communityAnswerInputContainer}>
                        <div className={detailedStyles.communityAnswerInput}>
                            <TextField value={userAnswer} onChange={handleAnswerChange} maxLength={10000} placeholder="Write your own answer..." multiline inputRef={userAnswerRef}>
                                <IconButton onClick={() => submitAnswer()} alt="Submit" className={detailedStyles.submitButton}>
                                    <PlaneIcon fill="#006233" />
                                </IconButton>
                            </TextField>
                            <p className={detailedStyles.markdownInstructions}>Tip: You can add a link using this format [link text](URL).</p>
                            {markdownPreview.length > 0 &&
                                <Card style={{ height: 'fit-content', width: '100%', display: "flex", flexDirection: 'column', border: '2px solid #006233', borderRadius: '12.5px', padding: '1vh' }}>
                                    <p style={{ alignSelf: 'center' }}><b>Answer Preview</b></p>
                                    <div
                                        style={{ flex: 1, padding: '1vh' }}
                                        className={detailedStyles.markdownLink}
                                        dangerouslySetInnerHTML={{ __html: markdownPreview }}
                                    />
                                </Card>}
                        </div>

                    </div>
                </Card>
            }
            {!isAuthenticated && isAddingAnswer &&
                <Card className={styles.cardAnswerContainerInput} style={{}}>
                    <div className={detailedStyles.communityAnswerInputContainer}>
                        <div className={detailedStyles.communityAnswerInput}>
                            <TextField value={userAnswer} onChange={handleAnswerChange} maxLength={10000} placeholder="Please add sources along with the answer..." multiline inputRef={userAnswerRef}>
                                <IconButton onClick={() => submitAnswer()} alt="Submit" className={detailedStyles.submitButton}>
                                    <PlaneIcon fill="#006233" />
                                </IconButton>
                            </TextField>
                            <p className={detailedStyles.markdownInstructions}>Tip: You can add a link using this format [link text](URL).</p>
                            {markdownPreview.length > 0 &&
                                <Card style={{ height: 'fit-content', width: '100%', display: "flex", flexDirection: 'column', border: '2px solid #006233', borderRadius: '12.5px', padding: '1vh' }}>
                                    <p style={{ alignSelf: 'center' }}><b>Answer Preview</b></p>
                                    <div
                                        style={{ flex: 1, padding: '1vh' }}
                                        className={detailedStyles.markdownLink}
                                        dangerouslySetInnerHTML={{ __html: markdownPreview }}
                                    />
                                </Card>}
                        </div>

                    </div>
                </Card>
            }

            {!isAddingAnswer && <ActionButton
                className={actionButtonStyles.goToNextQButton}
                    onClick={() => setIsAddingAnswer(true)}>
                <h3>Write your own answer  ✍🏼</h3>
            </ActionButton>}
                <ActionButton
                onClick={() => { router.push(`/qa/${QnA["next_id"]}`) }}
                    className={actionButtonStyles.goToNextQButton}>
                    <h3>Go to next question  ✌🏼</h3>
            </ActionButton>
            <p style={{ paddingTop: '3vh', textAlign: 'center' }}>Want to know when new answers or questions are added? <Link style={{ color: '#006233' }} href="/menu"><b>Subscribe</b></Link></p>

        </div>
        }
    </div>

};


export const getStaticProps: GetStaticProps = async (context) => {
    try {
        let response = await fetch(`${process.env.SERVER_SIDE_BACKEND_BASE_URL}/questions/${context.params.id}/?is_expert=true&prefetch=true`);
        let question = await response.json();
        return {
            props: {
                title: "Expert",
                questionText: question.question_forms.join("\n"),
                questionId: question.id,
            },
        };
    } catch (e) {
        return {
            notFound: true,
        }
    }
};

export const getStaticPaths: GetStaticPaths<{ id: string }> = async () => {

    return {
        paths: [],
        fallback: 'blocking'
    }
}

export default ExpertDetailedQnA;
