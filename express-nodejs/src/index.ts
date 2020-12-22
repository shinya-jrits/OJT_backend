import express from 'express'
import { Storage } from '@google-cloud/storage'
import Speech from '@google-cloud/speech'
import { stringify, v4 as uuidv4 } from 'uuid'
import sendgrid from '@sendgrid/mail'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

namespace GoogleCloud {
    export const gcpOptions = {
        projectId: "node-js-test-292505"
    };
}

function uploadFileToGCS(upFile: Buffer, address: string) {
    const fileName = uuidv4() + '.wav';
    const storage = new Storage(GoogleCloud.gcpOptions);
    const stream = storage.bucket('meeting_voice_data_jrits').file(fileName).createWriteStream({
        metadata: {
            contentType: 'audio/wav',
        },
        resumable: false
    });
    stream.on('error', (err) => {
        console.log(err);
    });
    stream.on('finish', () => {
        console.log('<GCS>upload file');
        speechToText("gs://meeting_voice_data_jrits/" + fileName, address);
    });
    stream.end(upFile);
}

async function sendMail(transcription: string, address: string) {
    try {
        const apiKey = await getSecretApi();
        if (apiKey != null) {
            sendgrid.setApiKey(apiKey);
        } else {
            console.log("api keyの取得に失敗しました");
            return;
        }

        const bufferText = Buffer.from(transcription);
        const msg = {
            to: address,
            from: 'shinya091118@gmail.com',
            subject: '文字起こし結果',
            text: (transcription.length > 0) ? '文字起こしが完了しました。' + transcription.length + '文字でした。'
                : '文字起こしに失敗しました',
            attachments: [
                {
                    content: bufferText.toString('base64'),
                    filename: 'result.txt',
                    type: 'text/plain',
                    disposition: 'attachment',
                    contentId: 'mytext',
                }
            ]
        }
        await sendgrid.send(msg);
        console.log("send mail success");
    } catch (err) {
        console.error(err.toString());
    }
}

async function getSecretApi(): Promise<string | null> {
    const client = new SecretManagerServiceClient(GoogleCloud.gcpOptions);
    const [accessResponse] = await client.accessSecretVersion({
        name: 'projects/972015880934/secrets/sendgrid_api_key/versions/latest',
    })
    if (accessResponse.payload?.data != null) {
        const responsePayload = accessResponse.payload.data.toString();
        return responsePayload;
    }
    return null;
}

async function speechToText(fileUri: string, address: string) {
    const client = new Speech.SpeechClient(GoogleCloud.gcpOptions);
    const config = {
        languageCode: 'ja-JP',
        enableAutomaticPunctuation: true,
    };
    const audio = {
        uri: fileUri,
    };
    const request = {
        config: config,
        audio: audio,
    };

    const [operation] = await client.longRunningRecognize(request);

    const [responese] = await operation.promise();

    if (responese.results != null) {
        if (responese.results[0].alternatives != null) {
            const trancription = responese.results.map((result) => result.alternatives![0].transcript).join('\n');
            sendMail(trancription, address);
        } else {
            console.log("文字を検出できませんでした。");
            sendMail("", address);
        }
    } else {
        console.log("[err]文字起こしに失敗しました");
        sendMail("", address);
    }

}

const app: express.Express = express();

//1時間あたり100mb程度なので2~3時間程度と予想する
app.use(express.json({ limit: '300mb' }));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

app.post('/api/', (req: express.Request, res: express.Response) => {
    const decodedFile = Buffer.from(req.body.file, "base64");
    uploadFileToGCS(decodedFile, req.body.mail);
    res.send("success");
});

app.listen(4000, () => { console.log('example app listening on port 4000!') });