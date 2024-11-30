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

const Register = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);

  const handleFileChange = (event) => {
    setPhoto(event.target.files[0]);
  };

  const handleRegister = async () => {
    try {
      if (!email.includes('@')) {
        setError("Invalid email format");
        return
      }

      if (email === '' || username === '' || password === '' || bio === '' || photo === null) {
        setError("Please fill in all fields");
        return
      }
      if (bio.length > 2000) {
        setError("Bio must be less than 2000 characters");
        return
      }

      setError(null)
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('email', email);
      formData.append('bio', bio);
          formData.append('file', photo); 
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/users/", {
        method: 'POST',
        headers: {
          // 'Content-Type': 'application/json'
        },
        body: formData

      });


      if (response.ok) {
        toast.success("Please check your inbox for a verification email.!", {
          autoClose: 3000,
        })
        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await wait(3000);
        router.push('/login');
        return
      }

      const data = await response.json();
      setError(data['detail'])
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  return (
    <div className={styles.authContainer}>
      <ToastContainer />
      <Card className={styles.cardContainer}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'auto' }}>
          <h1 style={{ color: 'black', paddingBottom: '2vh' }}>Register</h1>
          <Input
            name="Username (shown to others)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            name="Email (hidden from others)"
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

          <p style={{ textAlign: 'center', paddingBottom: '2vh' }}>Please share any relevant details about your qualifications. A fuller profile adds to your credibility with users. We appreciate your input.</p>
          <Input
            name="Bio (shown to others)"
            value={bio}
            type={InputType.TEXT_MULTI_LINE}
            onChangeTextArea={(e) => setBio(e.target.value)}
          />

          <Input
            name="Photo (optional)"
            type={InputType.PHOTO}
            value={photo}
            onChange={handleFileChange}
          />

          {error && <p className={actionButtonStyles.errorText}>{error}</p>}

          <ActionButton
            className={actionButtonStyles.loginAndRegisterButton}
            onClick={handleRegister}> Create Account </ActionButton>
                      <ActionButton
            className={actionButtonStyles.loginAndRegisterButton}
            onClick={() => router.push('login')}> Already have an account? Login </ActionButton>
        </div>
      </Card>
    </div>
  );
}

export default Register;