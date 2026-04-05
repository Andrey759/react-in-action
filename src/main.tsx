import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client'
import './index.css'

const root = createRoot(document.getElementById('root')!);


const data = {
    post: {
        id: 123,
        content: 'What we hope ever to do with ease, we must first learn to do with diligence. — Samuel Johnson',
        user: 'Mark Thomas',
    },
    comments: [
        { id: 0, user: 'David', content: 'such. win.' },
        { id: 1, user: 'Haley', content: 'Love it.' },
        { id: 2, user: 'Peter', content: 'Who was Samuel Johnson?' },
        { id: 3, user: 'Mitchell', content: '@Peter get off Letters and do your homework' },
        { id: 4, user: 'Peter', content: '@mitchell ok :P' },
    ],
};


class Post extends Component {
    render() {
        return React.createElement(
            'div',
            { className: 'post' },
            React.createElement(
                'h2',
                { className: 'postAuthor', id: this.props.id },
                this.props.user,
                React.createElement('span', { className: 'postBody' }, this.props.content)
            ),
            this.props.children
        );
    }
}
Post.propTypes = {
    user: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
};


class Comment extends Component {
    render() {
        return React.createElement(
            'div',
            { className: 'comment' },
            React.createElement(
                'h2',
                { className: 'commentAuthor' },
                this.props.user + ': ',
                React.createElement('span', { className: 'commentContent' }, this.props.content)
            )
        );
    }
}
Comment.propTypes = {
    id: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired,
};


class CreateComment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: '',
            user: '',
        };
        this.handleUserChange = this.handleUserChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleUserChange(event) {
        const val = event.target.value;
        this.setState(() => ({user: val}));
    }

    handleTextChange(event) {
        const val = event.target.value;
        this.setState(() => ({content: val}));
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.onCommentSubmit({
            user: this.state.user.trim(),
            content: this.state.content.trim(),
        });
        this.setState(() => ({ user: '', content: '' }));
    }

    render() {
        return React.createElement(
            'form',
            { className: 'createComment', onSubmit: this.handleSubmit },
            React.createElement('input', {
                type: 'text',
                placeholder: 'Your name',
                value: this.state.user,
                onChange: this.handleUserChange,
            }),
            React.createElement('input', {
                type: 'text',
                placeholder: 'Thoughts?',
                value: this.state.content,
                onChange: this.handleTextChange,
            }),
            React.createElement('input', { type: 'submit', value: 'Post' })
        );
    }
}


class CommentBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: this.props.comments,
        };
        this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    }

    handleCommentSubmit(comment) {
        comment.id = Date.now();
        const newComments = this.state.comments.concat([comment]);
        this.setState({ comments: newComments });
    }

    render() {
        return React.createElement(
            'div',
            { className: 'commentBox' },
            React.createElement(Post, {
                id: this.props.post.id,
                content: this.props.post.content,
                user: this.props.post.user,
            }),
            this.state.comments.map(function (comment) {
                return React.createElement(Comment, {
                    key: comment.id,
                    id: comment.id,
                    content: comment.content,
                    user: comment.user,
                });
            }),
            React.createElement(CreateComment, {
                onCommentSubmit: this.handleCommentSubmit,
            })
        );
    }
}


root.render(
    React.createElement(CommentBox, {
        comments: data.comments,
        post: data.post,
    })
);
