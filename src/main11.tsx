import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';

interface PostData {
    id: number;
    date: number;
    content: string;
}

interface CreatePostProps {
    onSubmit: (post: PostData) => void;
}

interface CreatePostState {
    content: string;
    valid: boolean;
}

class CreatePost extends Component<CreatePostProps, CreatePostState> {
    constructor(props: CreatePostProps) {
        super(props);
        this.state = { content: '', valid: false };
        this.handlePostChange = this.handlePostChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handlePostChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const content = event.target.value;
        this.setState({ content, valid: content.length > 0 && content.length <= 280 });
    }

    handleSubmit() {
        if (!this.state.valid) return;
        this.props.onSubmit({ id: Date.now(), date: Date.now(), content: this.state.content });
        this.setState({ content: '', valid: false });
    }

    render() {
        return (
            <div className="create-post">
                <textarea
                    value={this.state.content}
                    onChange={this.handlePostChange}
                    placeholder="What's on your mind?"
                />
                <button onClick={this.handleSubmit} disabled={!this.state.valid}>
                    Post
                </button>
            </div>
        );
    }
}

createRoot(document.getElementById('root')!).render(
    <CreatePost onSubmit={(post) => console.log('Submitted:', post)} />
);
