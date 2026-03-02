import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Send, CheckCircle } from "lucide-react";
import "../../../Style/Feedback.css";
import { useForm } from "react-hook-form";
import axios from "axios";

const Feedback = () => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = async (data) => {
        const res = await axios.post("http://localhost:3000/Feedback", data);
        if (res.status === 200) {
            setSubmitted(true);
        }
    };

    return (
        <div className="feedback-page">
            <div className="feedback-container">
                <motion.div
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="feedback-header"
                >
                    <div className="feedback-header-icon">
                        <MessageSquare className="w-12 h-12 text-purple-600" />
                    </div>
                    <h1 className="feedback-title">
                        We value your <span className="feedback-title-gradient">Feedback</span>
                    </h1>
                    <p className="feedback-subtitle">
                        Help us improve your shopping experience by sharing your thoughts!
                    </p>
                </motion.div>

                {!submitted ? (
                    <motion.form
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="feedback-form theme-card"
                        onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label>How would you rate your experience?</label>
                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`star-icon ${star <= (hoveredRating || rating) ? "active" : ""
                                            }`}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                {...register("name", { required: true })}
                                className="feedback-input"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                {...register("email", { required: true })}
                                className="feedback-input"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Your Thoughts</label>
                            <textarea
                                id="message"
                                rows="5"
                                {...register("message", { required: true })}
                                className="feedback-input"
                                placeholder="Tell us what you loved or what we can improve..."
                            ></textarea>
                        </div>

                        <button type="submit" className="theme-btn-primary feedback-submit-btn">
                            <Send className="w-5 h-5 mr-2 inline" /> Send Feedback
                        </button>
                    </motion.form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="feedback-success theme-card"
                    >
                        <CheckCircle className="success-icon" />
                        <h2>Thank You!</h2>
                        <p>Your feedback has been submitted successfully.</p>
                        <button
                            className="theme-btn-secondary mt-6"
                            onClick={() => { setSubmitted(false); setRating(0); }}
                        >
                            Submit Another Response
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Feedback;
