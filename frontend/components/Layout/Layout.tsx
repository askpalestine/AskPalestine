import React, { FunctionComponent, useState, useEffect } from "react";
import { Props } from "./Layout.interface";
import Head from "next/head";
import styles from "./Layout.module.css";
import Image from "next/image";
import { useRouter } from 'next/router';
import useAuthStatus from "@/hooks/useAuthStatus";
import Link from 'next/link';
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
} from 'next-share';

const Layout: FunctionComponent<Props> = ({ children, title, data }) => {
  const { isAuthenticated, username, handleLogin, handleLogout } = useAuthStatus();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className={styles.container}>
      <Head>
        <title>AskPalestine | Palestine FAQs Answers</title>
        <meta name="description" content="Application for pro-palestinians to read and share questions and answers " />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="For every pro-Palestinian to read and share answers that show the truth while not falling into the traps of misleading narratives. AskPalestine is there to give you the strength to speak up with confidence. Together, we'll make our voices heard."></meta>
        <meta name="author" content="AskPalestine Team"></meta>

        <meta property="og:type" content="website"></meta>
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_HTTP_URL}`}></meta>
        <meta property="og:title" content='AskPalestine | Palestine FAQs Answers'></meta>
        <meta property="og:description" content="For every pro-Palestinian to read and share answers that show the truth while not falling into the traps of misleading narratives. AskPalestine is there to give you the strength to speak up with confidence. Together, we'll make our voices heard."></meta>
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_HTTP_URL}/favicon.png`}></meta>
        <meta property="og:site_name" content="AskPalestine"></meta>

        <meta name="twitter:site" content="@askpalestine_qa"></meta>
        <meta name="twitter:title" content="AskPalestine | Palestine FAQs Answers"></meta>
        <meta name="twitter:description" content="For every pro-Palestinian to read and share answers that show the truth while not falling into the traps of misleading narratives. AskPalestine is there to give you the strength to speak up with confidence. Together, we'll make our voices heard."></meta>
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_HTTP_URL}/favicon.png`}></meta>
      </Head>

      <div className={styles.main}>

        <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingBottom: '1vh', justifyContent: 'center', }}>
          <img
            src="/home.png"
            onClick={() => router.push('/')}
            style={{
              width: '10%',
              height: 'auto',
              borderRadius: '50%',
              alignSelf: 'center',
              borderColor: '#006233 !important',
              borderStyle: 'solid',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', padding: '1vw', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
            <h1
              style={{
                fontSize: 'clamp(0px, 9vw, 70px)',
                textAlign: 'center',
                alignSelf: 'center',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              Ask<span style={{ color: '#006233' }}>P</span>alestin<span style={{ color: '#fe3133' }}>e</span>
            </h1>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Collection of Answers to Palestine Questions</h3>
          </div>
          <img
            src="/mail.png"
            onClick={() => router.push('/menu')}
            style={{
              width: '10%',
              height: 'auto',
              borderRadius: '50%',
              alignSelf: 'center',
              borderStyle: 'solid',
              borderColor: '#006233 !important',
            }}
          />
        </div>

        <div className={styles.content}>{children}</div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'center', gap: '10px', paddingTop: '30px'}}>
        <p style={{textAlign: 'center',  paddingBottom: '10px'}}>Follow Us:</p>

          <Link
            href="https://twitter.com/askpalestine_qa"
          >
            <TwitterIcon size={'clamp(0px, 9vw, 40px)'} round />
          </Link>
          <Link
            href="https://www.facebook.com/askpalestineinfo"
          >
            <FacebookIcon size={'clamp(0px, 9vw, 40px)'} round />
          </Link>
          <Link
            href="https://www.instagram.com/askpalestineinfo"
          >
            <InstagramIcon size={'clamp(0px, 9vw, 40px)'} round />
          </Link>

        </div>
        <p style={{ paddingTop: '10px', textAlign: 'center' }}>Want to know when new questions or answers are added? <Link style={{ color: '#006233' }} href="/menu"><b>Subscribe</b></Link></p>
        <p style={{ paddingTop: '10px', textAlign: 'center' }}>Want to contact us? Please reach out to us at <b>askpalestineinfo@gmail.com</b></p>
      </div>
    </div>
  );
};

export default Layout;
