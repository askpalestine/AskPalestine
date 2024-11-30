import qnaStyles from "../../styles/QnA.module.css";
import React, { FunctionComponent } from "react";
import detailedStyles from "../../styles/DetailedQnA.module.css";
import { Props } from "./Answer.interface";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import { useEffect, useRef, useState } from "react";
import Card from "@/components/Card/Card";
import { fetchData, putData, submitData } from "../../utils/dataRequests";
import ActionButton from "@/components/ActionButton/ActionButton";
import { useRouter } from "next/router";
import TextField from "@/components/TextField/TextField";
import IconButton from "@/components/IconButton/IconButton";
import { HeartFilledIcon, HeartOutlinedIcon, PlaneIcon } from "../../assets/svgs";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion } from "framer-motion"

import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TwitterShareButton,
  TwitterIcon,
} from 'next-share';
import { start } from "repl";

const Answer: FunctionComponent<Props> = ({ questionText, answer }) => {
  const router = useRouter()
  const [brokenImage, setBrokenImage] = useState<boolean>(false);
  const [isReporting, setIsReporting] = useState<boolean>(false);
  const [userReport, setUserReport] = useState<string>("")
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const userReportRef = useRef<HTMLInputElement>()
  const [imageHeight, setImageHeight] = useState('auto');

  const generateUniqueShareId = () => {
    return String(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  };
  const shareUrl = answerId => {
    const uniqueShareId = generateUniqueShareId();
    // Using the HTTP URL as some websites (e.g. Facebook) don't trust the SSL certificate of AskPalestine
    return `${process.env.NEXT_PUBLIC_FRONTEND_BASE_HTTP_URL}/qa/${router.query.id}?sharedAnswerId=${answerId}&shareId=${uniqueShareId}`;
  };

  const handleReport = async () => {
    if (userReportRef.current.value.length == 0) {
      toast.error("Please enter a report")
      return;
    }
    let body = {
      "text": userReportRef.current.value
    }
    try {
      await putData(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/answers/${answer.id}/report/`, body)
      userReportRef.current.value = ""
      setUserReport("")
    } catch {
      toast.error("Error submitting answer")
      return;
    }
    toast.success("Report submitted successfully! We will review it soon!")
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${questionText}\nAnswered by: ${answer["submitter"]["username"]}\nAnswer: ${answer.text}\nCheck the other answers here: ${shareUrl(answer["id"])}`)
    } catch {
      toast.error("Error copying to clipboard")
      return
    }
    toast.success("Copied to clipboard!");
    return true;
  }

  return (
    <Card className={detailedStyles.answerCardContainer}>
      <ToastContainer></ToastContainer>
      <div onClick={() => setIsExpanded(!isExpanded)} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingLeft: '10px', paddingRight: '10px' }}>
        <ActionButton
          className={qnaStyles.usernameButton}
          type="view"
          onClick={() => {
            if (isExpanded) {
              router.push(`/users/${answer["submitter"]["username"]}`);
            }
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: isExpanded ? '20px' : '0px' }}>
            {answer["submitter"] && answer["submitter"]["username"] && !brokenImage &&
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/users/photo/${answer["submitter"]["username"]}`}
                alt="Profile Photo"
                onError={() => setBrokenImage(true)}
                onLoad={(e) => setImageHeight(e.currentTarget.offsetWidth + 'px')}
                style={{
                  marginRight: '1vh',
                  borderRadius: '50%',
                  width: '42px',
                  maxWidth: '60px',
                  height: '42px',
                  maxHeight: '60px',
                  alignSelf: 'center'
                }} />
            }
            {isExpanded && <h3 style={{ color: 'black', paddingLeft: '10px', whiteSpace: 'nowrap' }}><u>{answer["submitter"]["username"]}</u></h3>}
            {!isExpanded && <h3 style={{ color: 'black', paddingLeft: '10px', whiteSpace: 'nowrap' }}>{answer["submitter"]["username"]}</h3>}
          </div>
        </ActionButton>
        {!isExpanded && <FaChevronDown color="black" style={{ marginLeft: '20px' }}></FaChevronDown>}
        {isExpanded && <FaChevronUp color="black" style={{ marginLeft: '20px' }}></FaChevronUp>}
      </div>
      {isExpanded &&

        <div>
          <motion.div
            initial={{ height: 0, }}
            animate={{ height: 'fit-content' }}
            transition={{ duration: 0.5 }} className={detailedStyles.answerContainer}>
            <div style={{ flex: 1 }}>

              {answer.source_type === 'YOUTUBE' && answer.source &&
                <div style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%', // 16:9 aspect ratio
                  overflow: 'hidden',
                  margin: '1vh'
                }}>
                  <iframe
                    src={answer.source}
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                    }}
                    title="YouTube Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              }
              <div
                style={{ flex: 1 }}
                className={detailedStyles.markdownLink}
                dangerouslySetInnerHTML={{ __html: answer.processedHtml }}>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingLeft: '3vw', paddingRight: '3vw' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                alignContent: 'center',
                width: '90%',
                paddingTop: '1vh',
                justifyContent: 'center',
              }}>
                <div className={detailedStyles.shareButtonsContainer}>

                  <img
                    src={"/copy.png"}
                    alt="Copy"
                    onClick={() => copyToClipboard()}
                    style={{
                      marginRight: '1vh',
                      borderRadius: '50%',
                      width: 'clamp(0px, 9vw, 40px)',
                      height: 'auto',
                      alignSelf: 'center'
                    }} />

                  <TwitterShareButton
                    url={shareUrl(answer["id"])}
                    title={`Question: ${questionText}\nCheck an answer by ${answer["submitter"]["username"]}.`}>
                    <TwitterIcon size={'clamp(0px, 9vw, 40px)'} round />
                  </TwitterShareButton>

                  <WhatsappShareButton
                    url={shareUrl(answer["id"])}
                    title={`Question: ${questionText}\nCheck an answer by ${answer["submitter"]["username"]}.`}>
                    <WhatsappIcon size={'clamp(0px, 9vw, 40px)'} round />
                  </WhatsappShareButton>


                  <FacebookShareButton
                    url={shareUrl(answer["id"])}
                  >
                    <FacebookIcon size={'clamp(0px, 9vw, 40px)'} round />
                  </FacebookShareButton>



                  <LinkedinShareButton
                    url={shareUrl(answer["id"])}
                  >
                    <LinkedinIcon size={'clamp(0px, 9vw, 40px)'} round />
                  </LinkedinShareButton>

                </div>
              </div>
              <svg style={{ maxWidth: "35px", maxHeight: "35", alignSelf: 'center' }} onClick={() => setIsReporting(!isReporting)} width='clamp(0px, 9vw, 40px)' height="30px" viewBox="0 0 24 24" fill="none">
                <path d="M5 21V3.90002C5 3.90002 5.875 3 8.5 3C11.125 3 12.875 4.8 15.5 4.8C18.125 4.8 19 3.9 19 3.9V14.7C19 14.7 18.125 15.6 15.5 15.6C12.875 15.6 11.125 13.8 8.5 13.8C5.875 13.8 5 14.7 5 14.7" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

          </motion.div>
          {isReporting && <Card className={qnaStyles.reportContainer} style={{}}>
            <div className={detailedStyles.communityAnswerInputContainer}>
              <div className={detailedStyles.communityAnswerInput}>
                <TextField value={userReport} onChange={() => { setUserReport(userReportRef.current.value) }} maxLength={5000} placeholder="Please add the issues you see in this answer..." multiline inputRef={userReportRef}>
                  <IconButton onClick={() => handleReport()} alt="Submit" className={detailedStyles.submitButton}>
                    <PlaneIcon fill="#006233" />
                  </IconButton>
                </TextField>

              </div>

            </div>
          </Card>
          }
        </div>}
    </Card>
  );
};

export default Answer;