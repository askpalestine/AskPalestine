import React, { useState } from 'react';
import Input from "@/components/Input/Input";
import ActionButton from '@/components/ActionButton/ActionButton';
import { InputType } from '@/components/Input/Input.interface';
import actionButtonStyles from '@/components/ActionButton/ActionButton.module.css';
import { useRouter } from 'next/router';
import Card from '@/components/Card/Card';
import styles from '../styles/Auth.module.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuthStatus from '@/hooks/useAuthStatus';

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { isAuthenticated, username, handleLogin, handleLogout } = useAuthStatus();

  const handleLoginRequest = async () => {

    if (!email.includes('@')) {
      setError("Invalid email format");
      return
    }

    if (email === '' || password === '') {
      setError("Please fill in all fields");
      return
    }

    setError(null)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/users/login/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
        })
      });

      const data = await response.json();
      if (response.ok && data['token']) {
        handleLogin(data)
        router.push('/qa');
        return
      }

      setError(data['detail'])
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className={styles.authContainer}>
      <ToastContainer />
      <Card className={styles.cardContainer}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
          <h1 style={{ color: 'black', paddingBottom: '2vh' }}>Login</h1>
          <Input
            name="Email"
            value={email}
            type={InputType.EMAIL}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            name="Password"
            value={password}
            type={InputType.PASSWORD}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className={actionButtonStyles.errorText}>{error}</p>}

          <ActionButton
            className={actionButtonStyles.loginAndRegisterButton}
            onClick={handleLoginRequest}> Login </ActionButton>

          <ActionButton
            className={actionButtonStyles.loginAndRegisterButton}
            onClick={() => router.push('/register')}> Don&apos;t have an account? </ActionButton>
        </div>
      </Card>
    </div>
  );
}

export default Login;