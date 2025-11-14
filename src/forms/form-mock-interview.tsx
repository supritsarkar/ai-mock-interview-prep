import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import type { Interview } from "@/types";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { useEffect, useState } from "react";
import { data, replace, useNavigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Headings } from "../components/ui/headings";
import { Button } from "../components/ui/button";
import { Loader, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { chatSession } from "@/scripts/index";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { tr } from "zod/v4/locales";

interface FormMockInterviewProps {
  initialData?: Interview | null;
}
//we need to create a form schema
const formSchema = z.object({
  position: z
    .string()
    .min(1, "Position is required")
    .max(100, "Position must be 100 characters or less"),

  description: z.string().min(10, "Description is required"),
  //It automatically converts (coerces) common values into the right type before validation
  experience: z.coerce
    .number()
    .min(0, "Experience cannot be empty or negative"),
  techStack: z.string().min(1, "Tech stack must be atleast a character"),
});

type FormData = z.infer<typeof formSchema>;

//maintains the form state and handles submission
export const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          position: initialData.position,
          description: initialData.description,
          experience: Number(initialData.experience),
          techStack: initialData.techStack,
        }
      : {
          position: "",
          description: "",
          experience: 0,
          techStack: "",
        },
  });

  const { isValid, isSubmitting } = form.formState;
  const [loading, setLoading] = useState(false); //load the form data
  const navigate = useNavigate(); //after creating the form rendering the landing page
  const { userId } = useAuth(); //for who created this form

  const title = initialData?.position
    ? initialData?.position
    : "Create a new Mock Interview"; //title of the interview form page
  const breadCrumbPage = initialData?.position
    ? initialData?.position
    : "Create";

  //appears on the buttn
  const actions = initialData ? "Save Changes" : "Create";
  //displays the toast message based on whether it's an update or create action
  const toastMessage = initialData
    ? { title: "Updated..!", description: "Changes saved successfully" }
    : { title: "Created..!", description: "New Mock Interview Created..." };

  //clear out the generated response
  const cleanAiResponse = (responseText: string) => {
    let cleanText = responseText.trim();

    // 1️⃣ Remove Markdown formatting (```json ... ```)
    cleanText = cleanText.replace(/```json|```/gi, "");

    // 2️⃣ Extract JSON array or object
    const jsonMatch = cleanText.match(/\[[\s\S]*?\]|\{[\s\S]*?\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    } else {
      console.error("❌ Raw AI Response:", responseText);
      throw new Error("No JSON structure found in the AI response.");
    }

    // 3️⃣ Fix common JSON issues
    cleanText = cleanText
      .replace(/[“”]/g, '"') // Replace curly quotes
      .replace(/'/g, '"') // Replace single with double quotes
      .replace(/,\s*([\]}])/g, "$1") // Remove trailing commas
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width spaces
      .replace(/(\w)"(\w)/g, "$1'$2"); // Fix unescaped double quotes like haven"t

    // 4️⃣ Try parsing the cleaned string
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      console.error("❌ Cleaned AI Response:", cleanText);
      throw new Error("Failed to parse AI response as JSON: " + error);
    }
  };

  //function to generate AI response
  const generateAiResponse = async (data: FormData) => {
    const prompt = `
        As an experienced prompt engineer, generate a JSON array containing 5 technical interview questions along with detailed answers based on the following job information. Each object in the array should have the fields "question" and "answer", formatted as follows:

        [
          { "question": "<Question text>", "answer": "<Answer text>" },
          ...
        ]

        Job Information:
        - Job Position: ${data?.position}
        - Job Description: ${data?.description}
        - Years of Experience Required: ${data?.experience}
        - Tech Stacks: ${data?.techStack}

        The questions should assess skills in ${data?.techStack} development and best practices, problem-solving, and experience handling complex requirements. Please format the output strictly as an array of JSON objects without any additional labels, code blocks, or explanations. Return only the JSON array with questions and answers.
        `;

    const aiResult = await chatSession.sendMessage(prompt);
    // return aiResult;
    const cleanedResponse = cleanAiResponse(aiResult.response.text());

    return cleanedResponse;
  };

  //onsubmit function to handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      if (initialData) {
        // update api
        if (isValid) {
          // create a new mock interview
          const aiResult = await generateAiResponse(data);

          // === UPDATE ===
          const mergedData = {
            userId: initialData.userId,
            createdAt: initialData.createdAt,
            ...data,
            questions: aiResult,
            updatedAt: serverTimestamp(),
          };

          if (!initialData?.id) {
            console.error(
              "Missing document ID — cannot update Firestore document"
            );
            return;
          }
          await updateDoc(
            doc(db, "interviews", initialData?.id),
            mergedData
          ).catch((error) => {
            console.log("Error updating document: ", error);
          });

          toast(toastMessage.title, { description: toastMessage.description });
        }
      } else {
        // create api

        if (isValid) {
          // create a new mock interview
          const aiResult = await generateAiResponse(data);

          const interviewRef = await addDoc(collection(db, "interviews"), {
            ...data,
            userId,
            questions: aiResult,
            createdAt: serverTimestamp(),
          });

          const id = interviewRef.id;

          await updateDoc(doc(db, "interviews", id), {
            id,
            updatedAt: serverTimestamp(),
          });

          toast(toastMessage.title, { description: toastMessage.description });
        }
      }

      navigate("/generate", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error("Error..", {
        description: `Something went wrong. Please try again later`,
      });
    } finally {
      setLoading(false);
    }
  };

  //maintains the form state when initial data changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        position: initialData.position,
        description: initialData.description,
        experience: initialData.experience,
        techStack: initialData.techStack,
      });
    }
  }, [initialData, form]);

  return (
    <div className="w-full flex-col space-y-4 ">
      <CustomBreadCrumb
        breadCrumbPage={breadCrumbPage}
        breadCrumbItems={[{ label: "Mock Interviews", link: "/generate" }]}
      />
      <div className="mt-4 flex items-center justify-between w-full">
        <Headings title={title} isSubHeading />

        {initialData && (
          <Button size={"icon"} variant={"ghost"}>
            <Trash2 className="min-w-4 min-h-4 text-red-500" />
          </Button>
        )}
      </div>
      <Separator className="my-4" />

      <div className="my-6"></div>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full p-8 rounded-lg flex flex-col items-start justify-start gap-6 shadow-md"
        >
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between ">
                  <FormLabel>Job Role/Job Position</FormLabel>
                  <FormMessage className="text-sm text-red-500" />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    disabled={loading}
                    className="h-12"
                    placeholder="eg:- Full stack developer"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between ">
                  <FormLabel>Job Description</FormLabel>
                  <FormMessage className="text-sm text-red-500" />
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={loading}
                    className="h-12"
                    placeholder="eg:- Describe the job role or position"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {/* experience */}
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between ">
                  <FormLabel>Years of Experience</FormLabel>
                  <FormMessage className="text-sm text-red-500" />
                </div>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    disabled={loading}
                    className="h-12"
                    placeholder="eg:- 5 years in number"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {/* tech stack */}
          <FormField
            control={form.control}
            name="techStack"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between ">
                  <FormLabel>Tech Stack</FormLabel>
                  <FormMessage className="text-sm text-red-500" />
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={loading}
                    className="h-12"
                    placeholder="eg:- React, Node.js, Python(seperate values with comma)"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="w-full flex items-center justify-end gap-6">
            <Button
              type="reset"
              size={"sm"}
              variant={"outline"}
              disabled={isSubmitting || loading}
            >
              Reset
            </Button>

            <Button
              type="submit"
              size={"sm"}
              disabled={isSubmitting || loading}
            >
              {loading ? (
                <Loader className="text-gray-50 animate-spin" />
              ) : (
                actions
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
