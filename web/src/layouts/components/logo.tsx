import { createStyles } from "antd-style"

const useStyles = createStyles(({token, css}) => {
    return {
        logo: css`
        display: flex;
        height: 72px;
        align-items: center;
        justify-content: start;
        padding: 0 24px;
        box-sizing: border-box;

        img {
            width: 24px;
            height: 24px;
            display: inline-block;
        }

        span {
            display: inline-block;
            margin: 0 8px;
            font-weight: bold;
            color: ${token.colorText};
            font-size: 16px;
        }
    `,
    }
})

const ChatLogo = () => {
    const {styles} = useStyles()
    return (
        <div className={styles.logo}>
            <img
            src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
            draggable={false}
            alt="logo"
            />
            <span>Cosplay-Chat</span>
        </div>
    )
}

export default ChatLogo
