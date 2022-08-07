import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { useRef, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const uploadButtonRef = useRef();
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState('');

  let requestController;

  const handleChange = (event) => {
    const actualFile = event.target.files[0];
    // if (!actualFile) return;
    setFile(actualFile)
  }

  const handleSubmit = () => {
    requestController = new AbortController();
    if (!file) return;
    const formData = new FormData();
    formData.append('img', file)
    axios.post('/api/file', formData, {
      onUploadProgress: (event) => {
        let progress = Math.round((event.loaded * 100) / event.total)
        setProgress(progress)
      },
      signal: requestController.signal
    })
      .then(({ data }) => {
        setImage(data.fileUrl);
        console.log('ok FOI')
        setProgress(0)
      })
      .catch((err) => console.log(err))
  }

  return (
    <Box>
      <Typography variant="h4">S3 Bucket test upload!</Typography>
      <input type="file" ref={uploadButtonRef} style={{ display: 'none' }} onChange={handleChange} />
      <Box sx={{ display: 'flex', gap: '5px' }}>
        <Button variant="contained" onClick={() => uploadButtonRef.current.click()}>Upload File</Button>
        <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        <Button color="error" variant="contained" onClick={() => requestController ? requestController.abort() : null}>Cancelar</Button>
      </Box>
      <Box>
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      {image && <img src={image} alt="teste" />}
    </Box>
  )
}


// (event.loaded * 100) / event.total
