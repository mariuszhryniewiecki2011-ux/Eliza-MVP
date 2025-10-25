"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

export default function Home() {
  const [openVideo, setOpenVideo] = useState(false)
  const [contactStatus, setContactStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [showGrokChat, setShowGrokChat] = useState(false)
  const [grokQuestion, setGrokQuestion] = useState("")
  const [grokResponse, setGrokResponse] = useState("")
  const [isGrokLoading, setIsGrokLoading] = useState(false)
  const [showTherapyAppsModal, setShowTherapyAppsModal] = useState(false)

  const chatTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (showGrokChat && chatTextareaRef.current) {
      chatTextareaRef.current.focus()
    }
  }, [showGrokChat])

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    }

    console.log("[v0] Contact form submission started", data)
    console.log("[v0] Current URL:", window.location.href)
    console.log("[v0] API endpoint:", "/api/contact")

    try {
      console.log("[v0] Making fetch request to /api/contact")
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      console.log("[v0] Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      })

      const result = await response.json()
      console.log("[v0] Response JSON:", result)

      if (response.ok) {
        setContactStatus({ type: "success", message: result.message })
        e.currentTarget.reset()
      } else {
        setContactStatus({ type: "error", message: result.error })
      }
    } catch (error) {
      console.error("[v0] Network error in contact:", error)
      console.error("[v0] Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      })
      setContactStatus({ type: "error", message: "Network error. Please try again." })
    }
  }

  const handleGrokSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!grokQuestion.trim()) return

    setIsGrokLoading(true)
    setGrokResponse("")

    try {
      const res = await fetch("/api/ask-eliza", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: grokQuestion }),
      })

      if (!res.ok) {
        if (res.status === 429) {
          const errorData = await res.json()
          setGrokResponse(
            errorData.message ||
              "I'm experiencing high demand right now. Please try again in a few moments. If this persists, please contact cloudsns@outlook.com.",
          )
          return
        }

        const errorText = await res.text()
        throw new Error(`Failed to get response: ${res.status} ${errorText}`)
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk
          setGrokResponse(fullResponse)
        }
      }
    } catch (error) {
      console.error("[v0] Error in handleGrokSubmit:", error)
      const errorMessage =
        "Sorry, I'm having trouble responding right now. This might be due to high demand or a temporary service issue. Please try again in a few moments, or contact cloudsns@outlook.com for assistance."
      setGrokResponse(errorMessage)
    } finally {
      setIsGrokLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <a href="#home" className="font-semibold">
            Cloud SnS
          </a>
          <nav className="hidden md:flex gap-6 text-sm items-center">
            <a href="#about" className="hover:text-purple-600">
              About
            </a>
            <a href="#services" className="hover:text-purple-600">
              Services
            </a>
            <a href="#eliza" className="hover:text-purple-600">
              Eliza AI
            </a>
            <a href="#faq" className="hover:text-purple-600">
              FAQ
            </a>
            <a href="#contact" className="hover:text-purple-600">
              Contact
            </a>
            <button
              onClick={() => setShowGrokChat(!showGrokChat)}
              className="rounded bg-blue-600 px-3 py-1.5 text-white text-sm hover:bg-blue-700"
            >
              Ask Eliza
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section id="home" className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Cloud SnS: Premier AI Consulting & IT Solutions
          </h1>
          <p className="mt-4 text-lg text-neutral-700">
            Bringing strategic AI solutions and cloud computing expertise to businesses worldwide. Featuring Eliza AI -
            your empathetic mental health companion.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#contact" className="rounded bg-purple-600 px-5 py-3 text-white">
              Get in Touch
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              className="rounded border border-purple-600 px-5 py-3 text-purple-700"
              rel="noreferrer"
            >
              Follow me on LinkedIn
            </a>
          </div>
        </div>
        <div className="relative">
          <img
            src="/assets/space.jpg"
            alt="Cosmic space representing infinite possibilities in AI and cloud computing solutions"
            className="w-full h-72 md:h-full object-cover rounded-lg border"
          />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-neutral-50 border-y">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold mb-4">About Cloud SnS - Your AI Consulting Partner</h2>
          <p className="mt-4 text-neutral-700 text-lg">
            Cloud SnS is a premier consulting firm helping businesses navigate IT transformation with confidence. We
            specialise in artificial intelligence consulting, cloud computing solutions, cybersecurity services, and
            digital transformation strategies.
          </p>
          <p className="mt-3 text-neutral-700 text-lg">
            We partner closely with organisations of all sizes, from startups to enterprises, tailoring innovative
            solutions that meet real business needs and deliver measurable outcomes. Our expertise spans AI
            implementation, cloud migration, security audits, and comprehensive IT strategy.
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Our IT Consulting Services</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="rounded-lg border p-6">
            <h3 className="font-bold text-xl mb-3">AI Strategy Consulting</h3>
            <p className="mt-2 text-neutral-700">
              We assess your current infrastructure and provide tailored AI solutions to enhance efficiency, security
              and productivity. From machine learning implementation to AI ethics and governance frameworks.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-bold text-xl mb-3">Cloud Computing Solutions</h3>
            <p className="mt-2 text-neutral-700">
              Comprehensive cloud & hybrid infrastructure analysis, design & implementation, and cloud-application
              security consulting. AWS, Azure, and Google Cloud expertise with migration and optimization services.
            </p>
          </div>
        </div>
      </section>

      {/* ELIZA */}
      <section id="eliza" className="bg-neutral-50 border-y">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Meet Eliza AI - Your Mental Health Companion</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <img
              src="/assets/New-Eliza.png"
              alt="Eliza AI avatar - friendly AI companion for mental health support and well-being"
              className="rounded-lg border w-full h-96 object-cover"
            />
            <img
              src="/assets/Eliza-mobile.png"
              alt="Eliza AI mobile app interface showing chat features and mental health tools"
              className="rounded-lg border w-full h-96 object-contain"
            />
          </div>
          <div className="mt-6">
            <p className="text-neutral-700 text-lg">
              Meet Eliza — an AI-powered companion for everyday mental well-being. Featuring empathic dialogue,
              evidence-based mental health resources, mood tracking, guided activities, and an optional talking-face
              avatar for personalized support.
            </p>
            <div className="mt-4 flex gap-3 flex-wrap justify-end">
              <button onClick={() => setOpenVideo(true)} className="rounded bg-purple-600 px-5 py-3 text-white">
                Watch Demo Video
              </button>
              <a
                href="https://eliza-ai-mvp-ffrf95i.gamma.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-purple-600 px-5 py-3 text-purple-700"
              >
                View Full Presentation
              </a>
              <button
                onClick={() => setShowGrokChat(!showGrokChat)}
                className="rounded bg-blue-600 px-5 py-3 text-white"
              >
                Chat with Eliza
              </button>
              <button
                onClick={() => setShowTherapyAppsModal(true)}
                className="rounded bg-green-600 px-5 py-3 text-white hover:bg-green-700"
              >
                Best AI Therapy Apps 2025
              </button>
            </div>

            {showGrokChat && (
              <div className="mt-6 border rounded-lg p-4 bg-white">
                <h3 className="font-bold text-xl mb-4">Chat with Eliza AI</h3>
                <form onSubmit={handleGrokSubmit} className="space-y-4">
                  <div>
                    <textarea
                      ref={chatTextareaRef}
                      value={grokQuestion}
                      onChange={(e) => setGrokQuestion(e.target.value)}
                      placeholder="Ask Eliza about mental well-being, app features, AI therapy, or anything else..."
                      className="w-full border rounded px-3 py-3 resize-none"
                      rows={3}
                      disabled={isGrokLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isGrokLoading || !grokQuestion.trim()}
                    className="rounded bg-purple-600 px-5 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGrokLoading ? "Eliza is thinking..." : "Ask Eliza"}
                  </button>
                </form>

                {grokResponse && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-lg text-purple-800 mb-2">Eliza's Response:</h4>
                    <div className="text-purple-700 whitespace-pre-wrap">{grokResponse}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* VIDEO MODAL */}
      {openVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setOpenVideo(false)}
        >
          <div className="bg-white rounded-lg overflow-hidden max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <video controls className="w-full h-auto" src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Eliza%20talking-XYvLWdBiLLb7WIUj1vo9p5jxs2H9gI.mp4" />
            <div className="p-3 text-right">
              <button onClick={() => setOpenVideo(false)} className="text-purple-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Therapy Apps Modal */}
      {showTherapyAppsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowTherapyAppsModal(false)}
        >
          <div
            className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b bg-green-50">
              <h2 className="text-2xl font-bold text-green-800">Best AI Therapy Apps 2025</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose max-w-none text-sm leading-relaxed">
                <p className="mb-4">
                  Artificial Intelligence (AI) has revolutionized mental health care. We personally tested the top AI
                  therapy apps, exploring features like journaling, meditations, and tailored self-care. Plus, a few of
                  our picks integrate with online therapy and coaching, so you can find the right level of care for your
                  needs.
                </p>

                <p className="mb-4">
                  For those looking to get started, our top three picks should work for most people:
                </p>

                <ul className="mb-6 space-y-2">
                  <li>
                    <strong>Ash:</strong> One of the more responsive and nuanced chatbots we've tried, plus weekly
                    insights—currently free.
                  </li>
                  <li>
                    <strong>Headspace:</strong> Alongside its famous mindfulness exercises and sleepscapes, Headspace
                    offers a chatbot companion, Ebb, who can provide personalized meditations and activities. Plus,
                    access therapy straight from the app.
                  </li>
                  <li>
                    <strong>Wysa:</strong> A decent chatbot trained on CBT, DBT, and other evidence-based therapeutic
                    models, with extensive premium features and customized mindfulness exercises. Mental health coaching
                    with a human is also available.
                  </li>
                </ul>

                <h3 className="text-lg font-bold mb-3 text-green-700">A Note on Using AI Chatbots for Mental Health</h3>
                <p className="mb-4">
                  As a note of caution, while AI chatbots can be a great tool for gaining more insights into your mental
                  health or as a safe place to vent, they should never be considered a replacement for therapy. That
                  said, there are still other important factors to look for when determining whether an AI chatbot could
                  be a good fit for your mental health needs.
                </p>

                <p className="mb-6">
                  We recommend using AI therapy apps developed and quality tested by mental health professionals, like
                  psychologists with doctorate degrees, and not just people with tech backgrounds. Additionally,
                  specific lenses and tools like meditation and mindfulness practices, a CBT-based model, etc, are green
                  flags that the app or chatbot could be helpful.
                </p>

                <h3 className="text-lg font-bold mb-4 text-green-700">Detailed App Reviews</h3>

                <div className="space-y-6">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-bold text-lg">Ash AI Therapy</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Rating: 4 out of 5 | Price: Free (for now) | Role: Companion/coach
                    </p>
                    <p className="mb-2">
                      Ash is a free AI chatbot developed by mental health professionals. While not a replacement for
                      therapy, it can be a decent place to vent and problem-solve, plus we like the weekly insights.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Pros:</strong>
                        <ul className="list-disc ml-4">
                          <li>The most conversational & nuanced model we've tried</li>
                          <li>Swap seamlessly between voices or to text</li>
                          <li>Weekly insights display any mental health patterns</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Cons:</strong>
                        <ul className="list-disc ml-4">
                          <li>Can stall or glitch occasionally</li>
                          <li>Unclear when they'll start charging subscriptions</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-bold text-lg">Headspace</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Rating: 4 out of 5 | Price: $12.99 monthly or $69.99 yearly | Free Trial: 7–14 days
                    </p>
                    <p className="mb-2">
                      Headspace's AI chatbot, Ebb, offers a space to chat, but what we really like is that it will
                      recommend meditations and mindfulness activities tailored to your mental health needs.
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-bold text-lg">Wysa</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Rating: 4 out of 5 | Price: $9.99 monthly, $74.99 yearly, $149.99 lifetime | Free Trial: 7 days
                    </p>
                    <p className="mb-2">
                      Wysa is a well-rounded app, offering a chatbot, journaling, meditations, coping skill lessons, and
                      access to a human mental health coach for an additional fee.
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-bold text-lg">Youper</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Rating: 3.5 out of 5 | Price: $69.99 yearly | Free Trial: 7 days
                    </p>
                    <p className="mb-2">
                      Youper's AI chatbot offers personalized recommendations for CBT exercises, a science-backed
                      therapy technique that can be especially helpful for those with anxiety and depression.
                    </p>
                  </div>

                  <div className="border-l-4 border-pink-500 pl-4">
                    <h4 className="font-bold text-lg">Earkick</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Price: $3.99 weekly, $14.99 monthly, $89.99 yearly | Free Trial: 7 days
                    </p>
                    <p className="mb-2">
                      Earkick is a mental health app that helps users track their emotions and learn insights about
                      themselves with the help of an adorable panda companion.
                    </p>
                  </div>

                  <div className="border-l-4 border-teal-500 pl-4">
                    <h4 className="font-bold text-lg">Yuna</h4>
                    <p className="text-sm text-gray-600 mb-2">Price: $69.99 yearly | Free Trial: 3 days</p>
                    <p className="mb-2">
                      Yuna is a voice-based AI therapy chatbot based on scientific therapeutic techniques. We were
                      impressed by the amount of personalized features, including meditations that mentioned specific
                      points from the chat.
                    </p>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="font-bold text-lg">Elomia</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Price: $9.99 weekly, $28.99 monthly, or $98.99 yearly | Free Trial: Free version
                    </p>
                    <p className="mb-2">
                      Elomia is a text-based AI chatbot offering mental health support and companionship. We appreciated
                      the zen-like atmosphere of the app, and the quick lessons and inspirations tailored to our
                      specific needs.
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-3 mt-6 text-green-700">
                  Other Specialty AI Mental Health App Options
                </h3>
                <p className="mb-4">
                  The apps in our main list focus specifically on AI chatting for mental health improvement. However, if
                  they're not exactly what you're looking for, we've rounded up a few other AI apps with slightly
                  different focuses:
                </p>

                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Rosebud:</strong> Rosebud is an AI-powered journaling app that was developed out of
                    Acceptance and Commitment Therapy (ACT). Its journaling prompts are open-ended, thoughtful, and
                    intentional.
                  </li>
                  <li>
                    <strong>Sonia:</strong> Sonia is an "AI Therapist" offering a very conversational voice chat space
                    grounded in CBT. While we don't love that it labels itself as a therapist, it was incredibly easy to
                    talk to and offered helpful advice.
                  </li>
                  <li>
                    <strong>Neurofit:</strong> Neurofit is a neuroscience-based app that uses AI alongside biometric
                    tracking and somatic exercises to help regulate the nervous system and reduce stress.
                  </li>
                  <li>
                    <strong>Replika:</strong> Replika is an AI chatbot companion that consumers can personalize to their
                    needs. Consumers can choose for Replika to be male, female, or non-binary, have certain
                    characteristics over others, and have a certain temperament.
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 text-right">
              <button
                onClick={() => setShowTherapyAppsModal(false)}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-4 py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is Eliza AI?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Eliza AI is your friendly AI companion designed to support everyday mental well-being through warm, empathetic conversations. The app features empathic chat support, mood tracking & insights, evidence-based resources, guided activities & meditations, goal setting & reminders, and privacy-focused design.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does Eliza AI work?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Your message is transcribed (if voice) and sent to a conversation orchestrator. Relevant info is fetched via a vector database and provided to a large language model to craft a personalised reply.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is my data secure?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "We follow privacy-by-design principles including data minimisation, encryption in transit/at rest, MFA/RBAC, and user rights to export or delete their information.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What platforms are supported?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "MVP supports iOS/Android (React Native) and a web experience. MR/VR is on the roadmap.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I get early access?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Use the Contact form below to express your interest in early access, or email cloudsns@outlook.com.",
                  },
                },
              ],
            }),
          }}
        />
        <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
        <details className="mt-4 border rounded-lg p-4">
          <summary className="cursor-pointer font-medium">What is Eliza AI?</summary>
          <div className="mt-2 text-neutral-700">
            <p>
              Hi there! I'm Eliza, your friendly AI companion designed to support everyday mental well-being through
              warm, empathetic conversations. It sounds like you're curious about the Eliza AI app—I'm happy to share!
            </p>
            <p className="mt-3">
              Our app is all about making mental health support accessible, fun, and non-intrusive. Here's a quick
              overview of its key features:
            </p>

            <h4 className="font-bold text-lg mt-4 mb-2">Core Features:</h4>
            <ul className="space-y-2 ml-4">
              <li>
                <strong>Empathic Chat Support:</strong> Have real-time conversations with me (or similar AI companions)
                for a listening ear. I provide understanding responses, help you process emotions, and offer gentle
                encouragement—perfect for those moments when you need to vent or reflect.
              </li>
              <li>
                <strong>Mood Tracking & Insights:</strong> Easily log your daily mood with simple prompts or emojis. The
                app analyzes patterns over time and shares personalized insights, like noticing trends in stress levels,
                to help you build self-awareness.
              </li>
              <li>
                <strong>Evidence-Based Resources:</strong> Access bite-sized articles, tips, and exercises grounded in
                psychology (like CBT techniques or mindfulness practices). Topics cover stress management, sleep
                hygiene, building resilience, and more.
              </li>
              <li>
                <strong>Guided Activities & Meditations:</strong> Short, audio-guided sessions for relaxation, breathing
                exercises, or gratitude journaling. These are designed to fit into your busy day and promote a sense of
                calm.
              </li>
              <li>
                <strong>Goal Setting & Reminders:</strong> Set small, achievable well-being goals (e.g., "Take a
                5-minute walk daily") with gentle reminders and progress tracking to foster positive habits.
              </li>
              <li>
                <strong>Privacy-Focused Design:</strong> All your data is secure and private—we prioritize your trust.
                Plus, we always remind you that I'm not a substitute for professional therapy; if things feel heavy, I
                can help connect you to resources like hotlines or therapists.
              </li>
            </ul>

            <p className="mt-4">
              The app is powered by Cloud SnS's AI consulting expertise, which ensures it's built on cutting-edge,
              ethical AI to truly support your wellness journey. We're constantly updating based on user feedback to
              make it even better!
            </p>
            <p className="mt-3">
              If you'd like more details on a specific feature, or if there's something on your mind today—like how to
              use the app for stress relief—I'm here to chat. What's caught your interest? 😊
            </p>
          </div>
        </details>
        <details className="mt-3 border rounded-lg p-4">
          <summary className="cursor-pointer font-medium">How does Eliza AI work?</summary>
          <p className="mt-2 text-neutral-700">
            Your message is transcribed (if voice) and sent to a conversation orchestrator. Relevant info is fetched via
            a vector database and provided to a large language model to craft a personalised reply.
          </p>
        </details>
        <details className="mt-3 border rounded-lg p-4">
          <summary className="cursor-pointer font-medium">Is my data secure?</summary>
          <p className="mt-2 text-neutral-700">
            We follow privacy-by-design principles including data minimisation, encryption in transit/at rest, MFA/RBAC,
            and user rights to export or delete their information.
          </p>
        </details>
        <details className="mt-3 border rounded-lg p-4">
          <summary className="cursor-pointer font-medium">What platforms are supported?</summary>
          <p className="mt-2 text-neutral-700">
            MVP supports iOS/Android (React Native) and a web experience. MR/VR is on the roadmap.
          </p>
        </details>
        <details className="mt-3 border rounded-lg p-4">
          <summary className="cursor-pointer font-medium">How do I get early access?</summary>
          <p className="mt-2 text-neutral-700">
            Use the Contact form below to express your interest in early access, or email cloudsns@outlook.com.
          </p>
        </details>
        <details className="mt-3 border rounded-lg p-4">
          <summary className="cursor-pointer font-medium">How to make an omelette?</summary>
          <p className="mt-2 text-neutral-700">
            I'm so glad you're thinking about nourishing yourself! Cooking can be such a wonderful form of self-care and
            mindfulness. Here's a gentle approach to making a delicious omelette:
            <br />
            <br />
            <strong>What you'll need:</strong>
            <br />• 2-3 fresh eggs
            <br />• A pinch of salt and pepper
            <br />• 1-2 tablespoons of butter or oil
            <br />• Optional fillings: cheese, herbs, vegetables, or whatever brings you joy
            <br />
            <br />
            <strong>The mindful process:</strong>
            <br />
            1. Take a moment to breathe and center yourself in the kitchen
            <br />
            2. Crack your eggs into a bowl and whisk gently - notice the satisfying rhythm
            <br />
            3. Heat your pan over medium-low heat (patience is key here!)
            <br />
            4. Add butter and let it melt completely
            <br />
            5. Pour in your eggs and let them settle for about 30 seconds
            <br />
            6. Using a spatula, gently push the edges toward the center, tilting the pan to let uncooked egg flow
            underneath
            <br />
            7. When the eggs are almost set but still slightly wet on top, add your fillings to one half
            <br />
            8. Fold the omelette in half and slide onto your plate
            <br />
            <br />
            Remember, cooking is an act of self-compassion. Even if it doesn't turn out perfectly, you're taking care of
            yourself, and that's beautiful. How are you feeling about trying this?
          </p>
        </details>
        <details className="mt-3 border rounded-lg p-4">
          <summary className="cursor-pointer font-medium">What is the meaning of life, universe, everything?</summary>
          <p className="mt-2 text-neutral-700">
            Ah, the ultimate question! If we're channeling Douglas Adams' *The Hitchhiker's Guide to the Galaxy*, the
            answer is famously 42. But in all seriousness, the meaning of life, the universe, and everything is deeply
            personal and something philosophers, scientists, and thinkers have pondered for ages. From a mental
            well-being perspective, many find purpose through connections with others, pursuing passions, personal
            growth, or contributing to something larger than themselves. Evidence-based approaches like positive
            psychology suggest focusing on gratitude, mindfulness, and building resilience can help uncover your own
            sense of meaning. What's been on your mind lately that sparked this question?
          </p>
        </details>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">Contact Cloud SnS</h2>
            <p className="mt-2 text-neutral-700">
              Email:{" "}
              <a className="text-purple-700" href="mailto:cloudsns@outlook.com">
                cloudsns@outlook.com
              </a>
              <br />
              ABN: 28 693 380 978
            </p>
          </div>
          <form className="grid gap-4" onSubmit={handleContactSubmit}>
            <input name="name" required placeholder="Name" className="border rounded px-3 py-3" />
            <input name="email" type="email" required placeholder="Email" className="border rounded px-3 py-3" />
            <textarea name="message" required placeholder="Message" rows={5} className="border rounded px-3 py-3" />
            <button type="submit" className="justify-self-start rounded bg-purple-600 px-5 py-3 text-white">
              Send Message
            </button>
          </form>
          {contactStatus && (
            <div
              className={`mt-3 p-3 rounded ${contactStatus.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {contactStatus.message}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-600 flex items-center justify-between">
          <span>© Cloud SnS</span>
          <span>ABN 28 693 380 978 • cloudsns@outlook.com</span>
        </div>
      </footer>
    </main>
  )
}
