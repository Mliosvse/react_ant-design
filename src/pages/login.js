import React from 'react'
import PropTypes from 'prop-types'
import { post } from '../utils/request';
import {Icon, Form, Input, Button, message } from 'antd';
import style from '../styles/login.css';
import logo from '../image/logo.png';

const FormItem = Form.Item;

message.config({
    top: 100,
    duration: 2,
});

class Login extends React.Component {
    constructor(props){
        super(props);
        this.state={

        };
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                post('/login.json',values).then((res)=>{
                    if(res.success){
                        message.success('登录成功');
                        this.context.router.push('/index');
                        window.localStorage.setItem('username',values.username);
                    }else {
                        message.error(res.message);
                    }
                });
            }
        });
    }

    render (){
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style.wrapper}>
                <header className={style.header}>
                    <img src={logo} alt=""/>
                </header>
                <div className={style.body}>
                    <section>
                        <h2 className={style.title}>用户登录</h2>
                        <Form onSubmit={this.handleSubmit} className={style.login_form}>
                            <FormItem>
                                {getFieldDecorator('username', {
                                    rules: [{ required: true, message: '请输入用户名!' }],
                                })(
                                    <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入用户名" />
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator('password', {
                                    rules: [{ required: true, message: '请输入密码!' }],
                                })(
                                    <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="请输入密码" />
                                )}
                            </FormItem>
                            <FormItem>
                                <Button type="primary" htmlType="submit" className={style.login_form_button}>
                                   登录
                                </Button>
                            </FormItem>
                        </Form>
                    </section>
                </div>
            </div>
        );
    }
}
Login.contextTypes={
    router: PropTypes.object.isRequired
}

Login = Form.create()(Login);

export default Login