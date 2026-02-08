const crypto = require('crypto');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { public_id, target_tag, cloud_name } = JSON.parse(req.body);
        
        // შენი მონაცემები
        const apiKey = "646963217153377"; 
        const apiSecret = "eZvCY12-BHkwvj9Ux_rOHGY98tA"; 
        
        const timestamp = Math.round(new Date().getTime() / 1000);

        // მნიშვნელოვანია: პარამეტრები უნდა იყოს ანბანური მიმდევრობით signature-სთვის
        // ჩვენ ვიყენებთ 'replace' ბრძანებას, რომ ძველი თეგი წაიშალოს და ახალი დაადოს
        const signatureStr = `command=replace&public_ids=${public_id}&tags=${target_tag}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

        const formData = new URLSearchParams();
        formData.append("public_ids", public_id);
        formData.append("tags", target_tag);
        formData.append("command", "replace");
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/tags`, {
            method: "POST",
            body: formData
        });
        
        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
