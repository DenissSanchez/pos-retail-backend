function pad(number, length) {

    return String(number).padStart(length, "0");

}

function generateSku(sequence){

    return `PRD-${pad(sequence,6)}`;

}

function generateBarcode(sequence){

    return `750${pad(sequence,9)}`;

}

module.exports={

    generateSku,

    generateBarcode

};