// app/routes/upload.tsx

import { AIResponseFormat } from 'constants';
import { prepareInstructions } from 'constants';
import React, { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar';
import { convertPdfToImage } from '~/lib/pdf2img';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore(); 
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    setStatusText('uploading the file...');

    const uploadFile = await fs.upload([file]);

    if(!uploadFile) return setStatusText("Error: Failed to upload file");

    setStatusText('convert to image');
    const imageFile = await convertPdfToImage(file);
    if(!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

    setStatusText('Uploading the image....');
    const uploadedImage = await fs.upload([imageFile.file]);
      if(!uploadedImage) return setStatusText("Error: Failed to upload file");

      setStatusText('Preparing data...');

      const uuid = generateUUID();

setStatusText('Analyzing...');

const feedback = await ai.feedback(
  uploadFile.path,
  prepareInstructions({ jobTitle, jobDescription, AIResponseFormat }),
);

// Once feedback is ready, then save everything to kv
const data = {
  id: uuid,
  resumePath: uploadFile.path,
  imagePath: uploadedImage.path,
  companyName,
  jobTitle,
  jobDescription,
  feedback,
};

await kv.set(`resume:${uuid}`, JSON.stringify(data));

setStatusText('Analysis complete, redirecting...');
navigate(`/resume/${uuid}`);




if(!feedback) return setStatusText('Error: Failed to analyze the resume');

const feedbackText = typeof feedback.message.content === 'string'
    ? feedback.message.content
    : feedback.message.content[0].text;

    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume: ${uuid}`, JSON.stringify(data));
    setStatusText('Analysis complete, redirecting...');
    console.log(data);
    
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form') as HTMLFormElement | null;
    if (!file) return;

    const formData = new FormData(form);

    const companyName = formData.get('company-name');
    const jobTitle = formData.get('job-title');
    const jobDescription = formData.get('description');

    // Minimal safety check
    if (
      typeof companyName !== 'string' ||
      typeof jobTitle !== 'string' ||
      typeof jobDescription !== 'string' ||
      !file
    ) {
      return;
    }

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
   
    
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-headling py-16">
          <h1>Smart feedback for your dream job</h1>

          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}

          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job title"
                  id="job-title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="description">Job Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  id="description"
                />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              {file && (
                <p className="text-sm text-green-600">
                  Selected file: {file.name}
                </p>
              )}
              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;