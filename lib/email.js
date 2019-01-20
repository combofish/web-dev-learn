var nodemailer = require('nodemailer');

module.exports = function(credentials){
    var = mailTransport = nodemailer.createTransport('SMTP',{

	host:'smtp.qq.com',
	port:465,
	secureConnection:true,
	auth:{
	    user:credentials.mailqq.user,
	    pass:credentials.mailqq.pass,
	}
    });

    var from = '"combofish station" <1986200290@qq.com>';
    var errorRecipient = '1986200290@qq.com';

    return {
	send:function(to, subj, body){
	    mailTransport.sendMail({
		from:from,
		to:to,
		subject:subj,
		html:body,
		generateTextFromHtml:true
	    },function(err,info){
		if(err) console.error('Unable to send  email: ' + err);
		console.log('Message sent: ' + info.response);
	    });
	},
	emailError:function(message,filename,exception){
	    var body = '<h1>combofish station Error</h1>' +
		'message:<br><pre>' +
		message + '</pre><br>';
	    if(exception) body += 'exception:<br><pre>' + exception +'</pre></br>';
	    if(filename) body += 'filename:<br><pre>' + exception +'</pre></br>';

	    mailTransport.sendMail({
		from:from,
		to:errorRecipient,
		subject:'combofish station error',
		html:body,
		generateTextFromHtml:true
	    },function(err,info){
		if(err) console.error("Unable to send email:" + err);
		console.log('Message sent ' + info.response);
	    });
	},
    };
};
