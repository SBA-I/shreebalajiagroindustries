import { useState, useRef } from "react";
import { Camera, Upload, Loader2, Sprout, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

const CropImageDetector = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this crop/plant image. Identify any pest, disease, or deficiency visible. Then recommend the best product from our catalog with dosage instructions. Be specific and practical.",
                },
                {
                  type: "image_url",
                  image_url: { url: image },
                },
              ],
            },
          ],
          userRole: "farmer",
          language: "en",
        }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to analyze image");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setResult(fullText);
            }
          } catch {}
        }
      }
    } catch (e: any) {
      setResult(`⚠️ ${e.message || "Failed to analyze. Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="h-5 w-5 text-primary" />
          Crop Disease Detector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload a photo of your crop leaf or plant, and AI will identify the pest/disease and suggest the right product.
        </p>

        {!image ? (
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Click to upload crop photo</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG — Max 5MB</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif,.gif,.bmp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="relative">
            <img src={image} alt="Crop" className="w-full max-h-64 object-cover rounded-xl" />
            <button
              onClick={reset}
              className="absolute top-2 right-2 bg-background/80 backdrop-blur rounded-full p-1.5 hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {image && !result && (
          <Button onClick={analyze} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...
              </>
            ) : (
              <>
                <Sprout className="h-4 w-4 mr-2" /> Detect Disease & Get Recommendation
              </>
            )}
          </Button>
        )}

        {result && (
          <div className="bg-muted rounded-xl p-4">
            <h4 className="font-bold text-sm text-primary mb-2">🔍 AI Analysis</h4>
            <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:my-1 [&>ul]:my-1">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
            <Button variant="outline" size="sm" onClick={reset} className="mt-4">
              Analyze Another Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CropImageDetector;
