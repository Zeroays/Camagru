import React, { Component } from 'react';

import axios from "axios";
import moment from "moment";

import { FaSync } from "react-icons/fa";
import "./Reusables/spinner.css";

import Modal from "react-bootstrap/Modal";

const getPostElapsedTime = timePosted => {
    const timeElapsedStr = moment.unix(timePosted / 1000).fromNow();
    return (timeElapsedStr);
}

const Pagination = ({ 
        postsPerPage, 
        totalPosts, 
        paginate, 
        currentPage, 
        pagnationLimit
    }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="container">
            <ul className="pagination">
                {pageNumbers.map(number => {
                    if (number >= currentPage - Math.floor(pagnationLimit / 2) && 
                        number <= currentPage + Math.floor(pagnationLimit / 2))
                        return (
                            <li key={number} className="page-item">
                                <button 
                                    onClick={() => paginate(number)} 
                                    className="page-link"
                                >
                                    {number}
                                </button>
                            </li>
                        )
                    return null;
                })}
            </ul>
        </div>
    );
}

const Photos = ({ loading, posts, curUser }) => {
    return (
        <>
            {loading
                ? <h2>Loading...</h2>
                :   posts.map(post => (
                        <Photo post={post} key={post._id} curUser={curUser}/>
                    ))
            }
        </>
    );
}

class Photo extends Component {
    state = {
        liked: false,
        likes: 0,
        comments: [],
        modalVisible: false,
        loadingComments: false
    }
    updateComments = (info, infoID) => {
        const { comments } = this.state;
        info['_id'] = infoID;
        const updatedComments = [info].concat(comments);
        this.setState({ comments: updatedComments })
    }
    componentDidMount = () => {
        const { post, curUser } = this.props;
        if (post.likes.indexOf(curUser) > -1) {
            this.setState({ liked: true });
        }
        this.setState({ likes: post.likesAmt });
        this.setState({ comments: post.comments.reverse() });
    }
    likePhoto = async() => {
        const { post } = this.props;
        const { liked } = this.state;
        
        const res = await axios.post(`/likePhoto`,
            { imgLink: post.imgLink, liked: !liked },
            { headers: {'Authorization': `Bearer ${localStorage.getItem("access_token")}`} }
        );

        if (res.data.authorized === true) {
            this.setState({ liked: !liked });
            this.setState({ likes: res.data.likesAmt })
        }
    }
    toggleComments = () => {
        this.setState({ modalVisible: !this.state.modalVisible });
    }


    render() {
        const { liked, likes, comments } = this.state;
        const { post, curUser } = this.props;
        return (
            <>
            <Modal show={this.state.modalVisible} onHide={this.toggleComments}>
                <Modal.Header>
                    <button type="button" className="close" onClick={this.toggleComments}>&times;</button>
                </Modal.Header>
                <Modal.Body>
                    <div className="row justify-content-center">
                        <img src={post.imgLink} width="75%" alt="" />
                    </div>
                    <hr />
                    <InputComment post={post} curUser={curUser} commentHandler={this.updateComments}/>
                    {  
                        
                        comments.map(comment => {
                            const { _id, user, content, date } = comment;
                            return <Comment key={_id} post={post} user={user} content={content} date={date}/>
                        })

                    }
                    <hr />
                </Modal.Body>
                <Modal.Footer></Modal.Footer>
            </Modal>
            <div key={post._id} className="card" style={{width: "30%"}}>
                <img src={post.imgLink} className="card-img-top" alt="hello" />
                <div className="card-body">
                    <h5 className="card-title">Created by {post.username}</h5>
                    <p className="card-text">{getPostElapsedTime(post.creationDate)}</p>
                    <button className="btn btn-primary" onClick={this.toggleComments}>Comment</button>
                    <button className={liked ? "btn btn-danger" : "btn btn-secondary"} onClick={this.likePhoto}>
                        ♥ Likes: {likes}
                    </button>
                </div>
            </div>
            </>
        )
    }
}

class InputComment extends Component {
    state = {
        comment: "",
        isCommenting: false,
        submittingComment: false
    }
    saveComment = event => {
        this.setState({ comment: event.target.value });
    }
    inputComment = () => {
        const { isCommenting } = this.state;
        if (isCommenting === false)
            this.setState({ isCommenting: true });
    }
    cancelComment = () => {
        this.setState({ isCommenting: false });
    }
    submitComment = async() => {
        const { comment } = this.state;
        const { post, commentHandler, curUser } = this.props;
        if (comment !== "") {
            this.setState({ submittingComment: true });
            const commentInfo = { imgLink: post.imgLink, user: post.username, content: comment, date: Date.now() };
            const res = await axios.post(`/commentPhoto`,
                commentInfo,
                { headers: {'Authorization': `Bearer ${localStorage.getItem("access_token")}`} }
            );
            this.setState({ submittingComment: false });
            this.setState({ isCommenting: false });
            this.setState({ comment: "" });
            if (res.data.authorized === true) {
                commentInfo['user'] = curUser;
                commentHandler(commentInfo, res.data._id);
            }
        }
    }
    render() {
        const { comment, isCommenting, submittingComment } = this.state;
        const inputBoxFocusStyle = {
            width: "100%",
            borderStyle: "hidden"
        }
        return (
            <>
            <span>
                <input
                    className="form-control shadow-none"
                    style={inputBoxFocusStyle}
                    type="text" 
                    width="100%"
                    value={comment}
                    placeholder="Add a public comment..."
                    onClick={this.inputComment}
                    onChange={this.saveComment}
                />
            </span>
            <hr />
            {
                isCommenting
                    ? <div className="container text-right" >
                        <button className="btn btn-secondary" onClick={this.cancelComment}>Cancel</button>
                        {
                            submittingComment
                                ? <FaSync className="spinner" />
                                : <button className="btn btn-primary" onClick={this.submitComment}>Submit</button>
                        }
                      </div>
                    : null
            }
            </>
        );
    }
}

const Comment = ({ user, content, date }) => {
    const userTitleStyle = {
        padding: "5px",
        color: "rgba(0,0,0,0.6)"
    }
    return (
        <>
            <header style={userTitleStyle}>
                {user} &bull; {getPostElapsedTime(date)}
            </header>
            <p style={{padding: "5px"}}>{content}</p>
        </>
    );
}



class Home extends Component {
    state = {
       curUser: null, 
       posts: [],
       loading: false,
       currentPage: 1,
       postsPerPage: 5,
       pagnationLimit: 5
    };

    componentDidMount() {
        const fetchPosts = async() => {
            this.setState({ loading: true });
            const res = await axios.get(`/allPhotos`,
                {headers: {'Authorization': `Bearer ${localStorage.getItem("access_token")}`}
            });
            this.setState({ posts: res.data.photos });
            this.setState({ curUser: res.data.user });
            this.setState({ loading: false });
        }
        fetchPosts();
        
    }

    paginate = (pageNumber) => {
        this.setState({ currentPage: pageNumber })
    }

    render() {
        const { currentPage, postsPerPage, posts, loading, pagnationLimit, curUser } = this.state;
        const indexOfLastPost = currentPage * postsPerPage;
        const indexOfFirstPost = indexOfLastPost - postsPerPage;
        const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost).reverse();
        return (
            <>
                <div className="container">
                    <h1 className="text-primary mb-3">Photos</h1>
                    <div className="row">
                        <Photos posts={currentPosts} loading={loading} curUser={curUser}/>
                        
                    </div>
                    
                </div>
                <Pagination 
                    postsPerPage={postsPerPage} 
                    totalPosts={posts.length}
                    paginate={this.paginate}
                    currentPage={currentPage}
                    pagnationLimit={pagnationLimit}
                />
            </>
        );
    }
}

export default Home;