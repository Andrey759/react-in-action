import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';

// --- Типы ---
interface CommentData {
    id: number;
    user: string;
    content: string;
}
interface PostData {
    id: number;
    user: string;
    content: string;
}

// --- Post ---
function Post({ user, content }: PostData) {
    return (
        <div className="post">
            <strong>{user}</strong>: {content}
        </div>
    );
}

// --- Comment ---
function Comment({ user, content }: Omit<CommentData, 'id'>) {
    return (
        <div className="comment">
            <em>{user}</em>: {content}
        </div>
    );
}

// --- CreateComment ---
interface CreateCommentProps {
    onCommentSubmit: (comment: Omit<CommentData, 'id'>) => void;
}
interface CreateCommentState {
    user: string;
    content: string;
}

class CreateComment extends Component<CreateCommentProps, CreateCommentState> {
    constructor(props: CreateCommentProps) {
        super(props);
        this.state = { content: '', user: '' };
        this.handleUserChange = this.handleUserChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleUserChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState(() => ({ user: event.target.value }));
    }

    handleTextChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState(() => ({ content: event.target.value }));
    }

    handleSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        this.props.onCommentSubmit({
            user: this.state.user.trim(),
            content: this.state.content.trim(),
        });
        this.setState(() => ({ user: '', content: '' }));
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit} className="createComment">
                <input value={this.state.user} onChange={this.handleUserChange} placeholder="Your name" type="text" />
                <input value={this.state.content} onChange={this.handleTextChange} placeholder="Thoughts?" type="text" />
                <button type="submit">Post</button>
            </form>
        );
    }
}

// --- CommentBox ---
interface CommentBoxProps {
    comments: CommentData[];
    post: PostData;
}
interface CommentBoxState {
    comments: CommentData[];
}

class CommentBox extends Component<CommentBoxProps, CommentBoxState> {
    constructor(props: CommentBoxProps) {
        super(props);
        this.state = { comments: this.props.comments };
        this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    }

    handleCommentSubmit(comment: Omit<CommentData, 'id'>) {
        const newComment: CommentData = { ...comment, id: Date.now() };
        this.setState({ comments: [...this.state.comments, newComment] });
    }

    render() {
        return (
            <div className="commentBox">
                <Post id={this.props.post.id} content={this.props.post.content} user={this.props.post.user} />
                {this.state.comments.map((comment) => (
                    <Comment key={comment.id} content={comment.content} user={comment.user} />
                ))}
                <CreateComment onCommentSubmit={this.handleCommentSubmit} />
            </div>
        );
    }
}

// --- Данные и рендер ---
const data = {
    post: { id: 1, user: 'Mark', content: 'Hello world!' },
    comments: [
        { id: 1, user: 'Stefan', content: 'Great post!' },
    ],
};

createRoot(document.getElementById('root')!)
    .render(
        <CommentBox comments={data.comments} post={data.post} />
    );
