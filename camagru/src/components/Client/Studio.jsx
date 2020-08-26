import React, { Component } from 'react';

import { CLOUDINARY_NAME } from "./Config";

import Modal from "react-bootstrap/Modal";
import { FaSync } from "react-icons/fa";

import axios from "axios";

import "./Reusables/spinner.css";

class Studio extends Component {
    state = {
        videoPermission: true,
        source: React.createRef(), 
        placeholder: ""
    }

    componentDidMount() {
        if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia( {video: true, audio: false} )
            .then(this.handleVideo)
            .catch(this.videoError)
            
        } 
    }
    addPhotoToGallery = src => {
        if (this.refs.gallery)
            this.refs.gallery.addPhotoToGallery(src);
    }
    handleVideo = stream => {
        //If video media device does not exist
        if (stream.getVideoTracks().length === 0) {
            return ;
            // console.log("Video Camera does not exist");
        }
        const { source } = this.state;
        source.current.srcObject = stream;
        this.setState( {source: source} );
    }

    videoError = err => {
        if (err.name === "NotAllowedError") {
            this.setState( {placeholder: null} );
            this.setState( { videoPermission: false });
        }
    }

    render() {
        const { source, placeholder } = this.state;
        const { width, height } = this.props;
        const flex = {
            display: "flex",
            flexDirection: "row"
        }
        const style = {
            width: "66%"
        }
        return (
            <div style={flex}>
                <div className="main-studio" style={style}>
                <video
                    ref={source} 
                    autoPlay={true}
                    width={0}
                    height={0}
                    poster={placeholder}
                />
                <PhotoCapture 
                    video={source}
                    videoPermission={this.state.videoPermission}
                    width={width}
                    height={height}
                    photoHandler={this.addPhotoToGallery}
                />
                </div>
                <Gallery ref="gallery"/>
            </div>
        );
    }
}

class Gallery extends Component {
    state = {
        loadingPhotos: true,
        photos: []
    };
    deleteImage = async(src, loadingHandler) => {
        const res = await axios.post(`/deletePhoto`,
            { src }, 
            { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } },
        )
        loadingHandler();
        if (res.data.deleted) {
            this.deletePhotoFromGallery(src);
        }
    }
    addPhotoToGallery = src => {
        const newPhotoGallery = this.state.photos;
        newPhotoGallery.unshift(src);
        this.setState({ photos: newPhotoGallery });
    }

    deletePhotoFromGallery = src => {
        const newPhotoGallery = this.state.photos;
        const index = newPhotoGallery.indexOf(src);
        if (index > -1) {
            newPhotoGallery.splice(index, 1);
            this.setState({ photos: newPhotoGallery });
        }
    }
    componentDidMount = () => {
        this.getPhotos();
    }
    getPhotos = async() => {
        const res = await axios.get(`/getPhotos`,
            { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}`} }
        )
        this.setState({ loadingPhotos: false });
        if (res.data.photos)
            this.setState({ photos: res.data.photos.reverse() });
    }
    render() {
        const style2 = {
            display: "block",
            width: "33%",
            minHeight: "400px",
            margin: "0 auto",
            borderColor: "black",
            borderStyle: "solid",
            borderWidth: "5px",
            overflowX: "hidden",
            overflowY: "scroll",
            textAlign: "center"
        }
        const { loadingPhotos, photos } = this.state;
        return (
            <div className="gallery" style={style2}>
                {loadingPhotos ? <p>Loading...</p> : photos.map(
                    photo => {return <GalleryPhotos src={photo} key={photo} id={photo} width="75%" display="block" imgHandler={this.deleteImage}/>}
                ) }
            </div>
        );
    }
}

class GalleryPhotos extends Component {
    state = {
        modelVisible: false,
        isLoading: false
    }
    toggleModel = () => {
        const modelVisible = !this.state.modelVisible;
        this.setState({ modelVisible });
    }
    deleteHandler = () => {
        this.setState({ isLoading: true });
        this.props.imgHandler(this.props.src, () => {
            this.setState({ isLoading: false })
            this.toggleModel();
        })
    }
    render() {
        const { src, id, width, display } = this.props;
        return (
            <>
                <img src={src} key={id} width={width} alt="" display={display} onClick={this.toggleModel}></img>
                <Modal show={this.state.modelVisible} onHide={this.toggleModel}>
                    <Modal.Header>
                        <button type="button" className="close" onClick={this.toggleModel}>&times;</button>
                    </Modal.Header>
                    <Modal.Body>
                        <img src={src} key={id} width={width} alt="" display={display}></img>
                    </Modal.Body>
                    <Modal.Footer>
                        {this.state.isLoading 
                            ? <FaSync className="spinner"></FaSync>
                            : <button className="btn btn-danger" onClick={this.deleteHandler}>Delete Image</button>
                        }
                    </Modal.Footer>

                </Modal>
            </>
        );
    }

}

class PhotoCapture extends Component {
    _isMounted = false;
    state = {
        video: this.props.video,
        selectedFile: new Image(),
        canTakePhoto: false,
        submittingPhoto: false,
        props: [],
    };
    fileSelectedHandler = event => {
        let img = new Image();
        img.src = URL.createObjectURL(this.refs.upload.files[0]);
        this.setState({ selectedFile: img });
        this.setState({ canTakePhoto: true });
    }
    takePhoto = async() => {
        const context = this.refs.canvas;
        if ((this.props.videoPermission === true 
            || this.state.canTakePhoto === true) && this.state.props.length !== 0) {
            const imgData = context.toDataURL("image/jpeg", 0.5);
            await axios.post(`/submitPhoto`,
                { 'photo': imgData },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } }
                )
                .then(res => {
                    if (this._isMounted) {
                        this.setState({ submittingPhoto: false });
                        this.props.photoHandler(res.data.imgLink);
                    }
                })
        }
    }

    drawFeed = () => {
        if (this._isMounted) {
            const { video } = this.state;
            const context = this.refs.canvas.getContext('2d');
            if (video.current.poster !== "") {
                context.drawImage(video.current, 0, 0, 600, 600);
            }
            else {
                context.drawImage(this.state.selectedFile, 0, 0, 600, 600);
            }
            for (let i = 0; i < this.state.props.length; i++) {
                context.drawImage(this.state.props[i].img, this.state.props[i].x, this.state.props[i].y, this.state.props[i].img.width, this.state.props[i].img.height);
            }
        }
        
    }

    componentDidMount = () => {
        this._isMounted = true;
        const canvasInfo = this.refs.canvas.getBoundingClientRect()
        document.addEventListener('mousedown', (e) => {
            let canvasMouseX = e.clientX - canvasInfo.x;
            let canvasMouseY = e.clientY - canvasInfo.y;
            
            let stateCopy = this.state.props;

            for (let i = 0; i < stateCopy.length; i++) {
                if (stateCopy[i].x < canvasMouseX && stateCopy[i].x + stateCopy[i].img.width > canvasMouseX) {
                    if (stateCopy[i].y < canvasMouseY && stateCopy[i].y + stateCopy[i].img.height > canvasMouseY) {
                        stateCopy[i].isDragging = true;
                        if (this._isMounted)
                            this.setState({ props: stateCopy });
                    }
                }
            }
            
        })
        document.addEventListener('mouseup', (e) => {
            let stateCopy = this.state.props;

            for (let i = 0; i < stateCopy.length; i++) {
                stateCopy[i].isDragging = false;
                if (this._isMounted)
                    this.setState({ props: stateCopy });
            }
        })
        document.addEventListener('mousemove', (e) => {
            let canvasMouseX = e.clientX - canvasInfo.x;
            let canvasMouseY = e.clientY - canvasInfo.y;

            let stateCopy = this.state.props;

            for (let i = 0; i < stateCopy.length; i++) {
                if (stateCopy[i].isDragging === true ) {
                    stateCopy[i].x = canvasMouseX - stateCopy[i].img.width / 2;
                    stateCopy[i].y = canvasMouseY - stateCopy[i].img.height / 2;
                    if (this._isMounted)
                        this.setState({ props: stateCopy });
                }
            }
        })
        this.interval = setInterval(() => this.drawFeed(), 33);
    }

    componentWillUnmount = () => {
        this._isMounted = false;
        clearInterval(this.interval);
    }

    drawProp = (src) => {
        const { props } = this.state;
        let img = new Image();
        img.setAttribute('crossorigin', 'anonymous');
        img.src = src;

        this.setState({ props: [...props, {img: img, x: 300, y: 300, isDragging: false}] })
        // this.setState({ canTakePhoto: true })
    }

    render() {
        const photoCanvas = {
            border: "5px dashed #1C6EA4",
            borderRadius: "0px 20px 0px 20px"
        }
        return (
            <>
                <canvas style={photoCanvas} width="600" height="600" ref="canvas"></canvas>
                <button onClick={this.takePhoto}>Take Photo</button>
                <input type="file" ref="upload" onChange={this.fileSelectedHandler}/>
                <PropList propHandler={this.drawProp}/>
            </>
        );
    }
}


class PropList extends Component {
    state = {
        isLoading: true,
        propInfo: []
    }
    componentDidMount = async() => {
        const res = await axios.get(`https://res.cloudinary.com/${CLOUDINARY_NAME}/image/list/prop.json`)
        this.setState({
            isLoading: false,
            propInfo: res.data["resources"]
        })
    }
    render() {
        if (this.state.isLoading)
            return null;
        return (
            this.state.propInfo.map(({ public_id }) => {
                return <PhotoProp propHandler={this.props.propHandler}
                    src={`https://res.cloudinary.com/${CLOUDINARY_NAME}/${public_id}`} 
                    key={public_id}/>
            })
        );
    }
}

const PhotoProp = ({ src, propHandler }) => {
    const clickHandler = () => {
        propHandler(src);
    }  
    return (
        <img src={src} alt="prop" width="200px" height="200px" onClick={clickHandler} />
    );
}

export default Studio;