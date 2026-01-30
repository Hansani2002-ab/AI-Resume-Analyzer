import { type FormEvent, useState } from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions, AIResponseFormat } from "../../constants";

const Upload = () => {
    const { fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
        setIsProcessing(true);

        try {
            setStatusText('Uploading the file...');
            // @ts-ignore
            const uploadedFile: any = await fs.upload([file]);
            if (!uploadedFile) return setStatusText('Error: Failed to upload file');

            const fileObj = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;

            setStatusText('Converting to image...');
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

            setStatusText('Uploading the image...');
            // @ts-ignore
            const uploadedImage: any = await fs.upload([imageFile.file]);
            const imageObj = Array.isArray(uploadedImage) ? uploadedImage[0] : uploadedImage;

            setStatusText('Analyzing with AI...');
            const uuid = generateUUID();
            
            // වැදගත්: මෙතනදී අපි file එකත් එක්කම AI එකට message එක යවනවා
            const response = await ai.chat(
                `Here is a resume for a ${jobTitle} position at ${companyName}. 
                 Job Description: ${jobDescription}. 
                 Please analyze it and return ONLY a JSON response in this format: ${JSON.stringify(AIResponseFormat)}`,
                { 
                    model: 'gpt-4o', 
                    file: fileObj, // මේකෙන් AI එකට file එක කියවන්න පුළුවන්
                    temperature: 0
                }
            );

            if (!response) throw new Error("No response from AI");

            const feedbackText = typeof response.message.content === 'string'
                ? response.message.content
                : (response.message.content as any)[0].text;

            let parsedFeedback;
            try {
                const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
                const cleanJson = jsonMatch ? jsonMatch[0] : feedbackText;
                parsedFeedback = JSON.parse(cleanJson);
            } catch (e) {
                console.error("AI Response was not JSON:", feedbackText);
                throw new Error("AI could not read the resume text properly.");
            }

            const finalData = {
                id: uuid,
                resumePath: fileObj.path,
                imagePath: imageObj.path,
                companyName, 
                jobTitle, 
                jobDescription,
                feedback: parsedFeedback 
            }

            await kv.set(`resume:${uuid}`, JSON.stringify(finalData));
            
            setStatusText('Redirecting to results...');
            navigate(`/resume/${uuid}`);

        } catch (error: any) {
            console.error("Analysis Error:", error);
            setStatusText(`Error: ${error.message || 'Something went wrong'}`);
            setIsProcessing(false);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (!file) return alert("Please upload a file");

        handleAnalyze({ 
            companyName: formData.get('company-name') as string, 
            jobTitle: formData.get('job-title') as string, 
            jobDescription: formData.get('job-description') as string, 
            file 
        });
    }

    return (
        <main className="bg-gray-50 min-h-screen">
            <Navbar />
            <section className="max-w-4xl mx-auto py-12 px-4">
                {isProcessing ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">{statusText}</h2>
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="h-48 w-48 bg-blue-100 rounded-full mb-4"></div>
                            <p className="text-slate-500 mt-2">This might take a few seconds...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                        <h1 className="text-3xl font-bold mb-6">Analyze Your Resume</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="company-name" placeholder="Company Name" className="w-full p-3 border rounded" required />
                            <input name="job-title" placeholder="Job Title" className="w-full p-3 border rounded" required />
                            <textarea name="job-description" placeholder="Job Description" rows={4} className="w-full p-3 border rounded" required />
                            <FileUploader onFileSelect={handleFileSelect} />
                            <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold hover:bg-blue-700 transition">
                                Start AI Review
                            </button>
                        </form>
                    </div>
                )}
            </section>
        </main>
    )
}
export default Upload;