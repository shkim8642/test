//var req_manager_email = SpreadsheetApp.getActive().getSheetByName("CODE").getRange("B13").getValue(); //개발요청, QA요청 (QA)
//var req_project_email = SpreadsheetApp.getActive().getSheetByName("CODE").getRange("B14").getValue(); //설문요청, QA fail (project)
//var end_deploy_email = SpreadsheetApp.getActive().getSheetByName("CODE").getRange("B15").getValue(); //패치완료 (PM, QA, 기술지원)
//var g_ccEmail = SpreadsheetApp.getActive().getSheetByName("CODE").getRange("B16").getValue();
//var qa_manager_email = SpreadsheetApp.getActive().getSheetByName("CODE").getRange("B17").getValue(); //QA 담당자(개발자 TC 작성 요청)

//for test
//var req_manager_email = "sinhyekim@rsupport.com"; //개발요청, QA요청 (QA)
//var qa_manager_email = "sinhyekim@rsupport.com"; //QA 담당자(개발자 TC 작성 요청)
//var req_project_email = "sinhyekim@rsupport.com"; //설문요청, QA fail (project)
//var end_deploy_email = "sinhyekim@rsupport.com"; //패치완료 (PM, QA, 기술지원)
//var g_ccEmail = "sinhyekim@rsupport.com";
//var testEmail = "sinhyekim@rsupport.com";

var g_seq_range = SpreadsheetApp.getActive().getSheetByName("CODE").getRange("B2");

var cell_deployStatus = "P";


// Rows Check
function checkRest() {
  var ing_row = SpreadsheetApp.getActive().getSheetByName("진행중").getMaxRows();
  var survey_row = SpreadsheetApp.getActive().getSheetByName("설문지 응답 시트").getMaxRows() - SpreadsheetApp.getActive().getSheetByName("설문지 응답 시트").getLastRow();
  if( ing_row > 94 && ing_row < 100 ) {
    MailApp.sendEmail(testEmail, "[연구개발본부]RC Master 서버 현황 문서의 진행중탭 Rows가 얼마남지 않았습니다", "body", { htmlBody: "참고문서:https://docs.google.com/spreadsheets/d/10LMJnPaGUm53ors9pSNwMviCWk3UwLns0rgPrXcWjIo/edit#gid=0", cc: testEmail });
  }
  if( survey_row > 94 && survey_row < 100 ) {
    MailApp.sendEmail(testEmail, "[연구개발본부]RC Master 서버 현황 문서의 설문지탭 Rows가 얼마남지 않았습니다", "body", { htmlBody: "참고문서:https://docs.google.com/spreadsheets/d/10LMJnPaGUm53ors9pSNwMviCWk3UwLns0rgPrXcWjIo/edit#gid=999195490", cc: testEmail });
  }
}

// 메뉴추가
function onOpen() {
    var subMenus  = [
        {name: "▶▶ 진행현황 반영하기", functionName: "processBM"},
    ];
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ss.addMenu("진행현황", subMenus);
}

// Business Logic
function processBM() {

  Logger.log("ProcessBM started");
      
  // Rows Check
  checkRest();
      
  // 진행중탭
  var ss_ing = SpreadsheetApp.getActive().getSheetByName("진행중");
  var range = ss_ing.getRange("B4:AC");
  var data = range.getValues();

  var deploy_info = new Array();
  var deploy_cnt = 0, row_cnt = 3;
  var notyet_cnt, deploy_st,remind_yn, seq_no, mng_no, issue_no_gid, issue_no, company_nm, deploy_type, req_deploy_date, requester, deploy_server, folder_nm, dev_tc, dev_tc_st, deploy_date, mail_send_status, mail_subject, mail_body;
  var dev_type, m_sBackend, m_sMac, m_sAndroid, m_sIos, m_sPc, m_sBase;
  var deploy_memo;

  for(var i = 0; i < data.length; i++) {
    row_cnt++;
    //납품번호 비어있으면 loop종료
    if( data[i][5] == "" )  break;

      // 초기화
    deploy_info = new Array();
    dev_type = "";
    seq_no = g_seq_range.getValue();
  
    // Fetch
    notyet_cnt = data[i][0];
    mail_send_status = data[i][1];
    remind_yn = data[i][2];
    issue_no_gid = data[i][3];
    mng_no = data[i][4];
    issue_no = data[i][5];
    company_nm = data[i][6];
    deploy_type = data[i][7];             // 2018.03.16 [기술지원요구사항]으로 사용하던 필드를 [납품구분]으로 사용목적을 바꿈 
    req_deploy_date = data[i][8];
    requester = data[i][9];
    deploy_server = data[i][10];  //배포 서버 선택

    folder_nm = data[i][11];
    dev_tc = data[i][12];
    
    dev_tc_st = data[i][13]; //개발자 TC 상태
    dev_tc_st = dev_tc_st.toUpperCase(); //항상대문자로 받음

    deploy_st = data[i][14];  //배포 상태
    m_sBackend = data[i][21];
    m_sPc = data[i][22]; 
    m_sBase = data[i][23];
    m_sAndroid = data[i][24];
    m_sIos = data[i][25];
    m_sMac = data[i][26];

    deploy_memo = data[i][27]; //패치실패 사유 란
  
    //importrange error로 인해 업체명 #N/A 표시하면 건너뛰기
    if( company_nm == "#N/A")  break;

    //개발 요청이 아닌데 관리번호 비어 있으면 loop 종료
    if( (mng_no == "" || mng_no == "-") && (deploy_st != "개발 요청" || deploy_st == ""))  break;
  
    if( m_sBackend == "Y" )  dev_type += "BackEnd/";
    if( m_sMac == "Y" )  dev_type += "Mac/";
    if( m_sAndroid == "Y" )  dev_type += "Android/";
    if( m_sIos == "Y" )  dev_type += "iOS/";
    if( m_sPc == "Y" )  dev_type += "응용/";
    if( m_sBase == "Y" )  
    {
      dev_type += "기반기술/";
      req_project_email = "basictech2@rsupport.com, " + SpreadsheetApp.getActive().getSheetByName("CODE").getRange("B14").getValue();      
    }  else {
      req_project_email = SpreadsheetApp.getActive().getSheetByName("CODE").getRange("B14").getValue();   
    }
  
    // 개발요청 메일발송 : 개발 서버 선택, 폴더 경로 필수 
    if( issue_no != "" && company_nm != "" && deploy_type != "" && req_deploy_date != "" && deploy_server != "" && requester != "" && (deploy_st == "개발 요청" || deploy_st == "") && mail_send_status == "")
    {
      // Mail Title&Body
      Logger.log("[개발 요청]deploy_st : "+deploy_st+" issue_no : "+issue_no+" company_nm :"+company_nm+" deploy_type : "+deploy_type+" req_deploy_date : "+req_deploy_date+" requester :"+requester);
      
      mail_subject = "[RC-"+ company_nm +"] 개발 요청";
      mail_body = makeTemplateReqDev(company_nm, toYmd(req_deploy_date), requester, dev_type, deploy_server, folder_nm);
      
      ss_ing.getRange("F"+row_cnt).setValue((new Date()).getYear()+"-"+(++seq_no));
      ss_ing.getRange("C"+row_cnt).setValue("개발 요청");
      ss_ing.getRange(cell_deployStatus +row_cnt).setValue("개발 요청");
      sendEmail(req_manager_email, mail_subject, mail_body);
      g_seq_range.setValue(seq_no);

      //to QA 개발자 테스트 케이스 요청
    }
    else if( deploy_st == "개발 진행중" )
    {
      ss_ing.getRange("C"+row_cnt).setValue("개발 진행중");
    }
    else if( deploy_st == "개발 완료" )
    {
      if (notyet_cnt > 0 )
      {
        if( mail_send_status != "QA 완료 (FAIL)" && mail_send_status != "설문 요청 완료" && m_sBackend != "" && m_sMac != "" && m_sAndroid != "" && m_sIos != "" && m_sPc != "" && m_sBase != "" )
        {
          //설문 발송
          Logger.log("[개발 완료]notyet_cnt : "+notyet_cnt+" deploy_st : "+deploy_st+" mail_send_status : "+mail_send_status+" m_sBackend :"+m_sBackend+" m_sMac : "+m_sMac+" m_sAndroid : "+m_sAndroid+" m_sIos :"+m_sIos);
          
          if( dev_type.length >= 1 )  dev_type = dev_type.slice(0,-1);
          
          // Mail Title&Body
          mail_subject = "[RC-" + company_nm + "] 개발완료 설문 요청";
          mail_body = makeTemplateReqSurvey(mng_no, issue_no, issue_no_gid, company_nm, toYmd(req_deploy_date), requester, dev_type,  deploy_server, folder_nm);
          sendEmail(req_project_email, mail_subject, mail_body);
          ss_ing.getRange("C"+row_cnt).setValue("설문 요청 완료");
        }
      }
      else if( notyet_cnt == 0 )
      {
        //개발자 TC 작성 요청
        if(dev_tc != "" && dev_tc_st != "PASS")
        {
          mail_subject = "[RC-" + company_nm + "] 개발자 테스트 요청";
          mail_body = makeTemplateReqDevTC(company_nm, toYmd(req_deploy_date), requester, dev_type, dev_tc);
          sendEmail(req_project_email, mail_subject, mail_body);
          ss_ing.getRange("C"+row_cnt).setValue("개발자테스트 요청");
          ss_ing.getRange(cell_deployStatus + row_cnt).setValue("개발자테스트 요청");
        } 
        //개발자 TC 없으면 QA에게 요청 메일
        else if(dev_tc == "" && mail_send_status != "개발자TC입력요청")
        {
          mail_subject = "[RC-" + company_nm + "] 개발자 TestCase가 없습니다.";
          mail_body = makeReqDevTCforQA(company_nm, toYmd(req_deploy_date), requester, dev_type);
          sendEmail(qa_manager_email, mail_subject, mail_body);
          ss_ing.getRange("C"+row_cnt).setValue("개발자TC입력요청");
        }
        else if(dev_tc != "" && dev_tc_st == "PASS")
        {
          ss_ing.getRange("C"+row_cnt).setValue("개발자테스트 요청");
          ss_ing.getRange(cell_deployStatus + row_cnt).setValue("개발자테스트 요청");
        }
      }
    }
    else if( deploy_st == "개발자테스트 요청" )
    {
      if(dev_tc != "" && dev_tc_st == "PASS")
      {
        //QA 요청
        mail_subject = "[RC-" + company_nm + "] QA 요청";
        mail_body = makeTemplateReqQa(company_nm, toYmd(req_deploy_date), requester, dev_tc);
        sendEmail(req_manager_email, mail_subject, mail_body);
        ss_ing.getRange("C"+row_cnt).setValue("QA 요청");  
        ss_ing.getRange(cell_deployStatus + row_cnt).setValue("QA 요청");
      }
    }
    else if( deploy_st == "QA 완료 (FAIL)" )
    {
      if( mail_send_status != "QA 완료 (FAIL)" )
      {
        mail_subject = "[RC-" + company_nm + "] QA 완료 (FAIL)";
        mail_body = makeTemplateQaResult(mng_no, issue_no, issue_no_gid, company_nm, toYmd(req_deploy_date), requester, dev_type, deploy_server, folder_nm);
        sendEmail(req_project_email, mail_subject, mail_body);
        ss_ing.getRange("C"+row_cnt).setValue("QA 완료 (FAIL)"); 
      }
    }
    else if( deploy_st == "배포 완료 (PASS)" || deploy_st == "배포 완료 (FAIL)" || deploy_st == "배포 완료 (NQ)" )
    {
      //배포 완료일때 메일 한번더 보내주기
      if( mail_send_status != "배포 완료 (PASS)" && mail_send_status != "배포 완료 (FAIL)" && mail_send_status != "배포 완료 (NQ)" )
      {
        // 설문 체크 : 설문 결과 시트 열 15~20
        var survType = [ 'Q3', 'R3', 'S3', 'T3', 'U3', 'V3' ]; //개발분야  
        var surveyresult = "";
        for (var j = 15; j < 21; j++) {
          if (data[i][j] != "N/A") {
            surveyresult += "<br>[" + ss_ing.getRange(survType[j-15]).getValue() + "]" + data[i][j];
          }
        }

        mail_subject = "[RC-" + company_nm + "] " + deploy_st;
        mail_body = makeTemplateDeployResult(mng_no, issue_no, issue_no_gid, company_nm, toYmd(req_deploy_date), requester, dev_type, deploy_server, folder_nm, deploy_st, surveyresult);
        sendEmail(end_deploy_email, mail_subject, mail_body);
        ss_ing.getRange("C"+row_cnt).setValue(deploy_st); 
      }
    }
    //패치 완료일때 이동한다
    else if( deploy_st == "패치 완료")
    {
      var deploy_folder = "";
      if(deploy_server == "AWS"){
        deploy_folder = "[" + deploy_server + "]" + folder_nm;
      }
      else {
        deploy_folder = "[" + deploy_server + "]" + folder_nm;
      }

      if( deploy_folder != "[Master]" )
      {
        Logger.log("[패치 완료]deploy_st : "+deploy_st );
        
        mail_subject = "[RC-" + company_nm + "] " + deploy_st;
        mail_body = makeTemplateEndDeploy(company_nm, toYmd(new Date()), deploy_server, folder_nm, deploy_st);
        sendEmail(end_deploy_email, mail_subject, mail_body);
        
        // 배포완료탭에 복사하기
        var apply_info = new Array();
        apply_info[0] = mng_no;
        apply_info[1] = "=HYPERLINK(\"https://docs.google.com/spreadsheets/d/1NZ3tl8xKlaWU_5duucfL9LqEkae3nVVCn7g-5domRc0/edit#gid="+issue_no_gid+"\","+issue_no+")";
        apply_info[2] = company_nm;
        apply_info[3] = deploy_type;
        apply_info[4] = req_deploy_date;
        apply_info[5] = requester;
        apply_info[6] = deploy_folder;
        apply_info[7] = new Date();
        apply_info[8] = data[i][15];  //웹 개발 설문 참고사항(숨김 셀)
        apply_info[9] = data[i][16];
        apply_info[10] = data[i][17];
        apply_info[11] = data[i][18];
        apply_info[12] = data[i][19];
        apply_info[13] = data[i][20]; //맥 개발 설문 참고사항(숨김 셀)
        apply_info[14] = mail_send_status; //메일 보낸 상태(직전 상태 저장)를 배포상태로 전달.
        
        deploy_info = new Array();
        deploy_info.push(apply_info);
        var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("패치완료");
        ss.insertRowAfter(40);
        ss.getRange("B41:P41").setValues(deploy_info);
        
        // 진행중 탭에서 삭제하기
        ss_ing.deleteRow(row_cnt);
        row_cnt--;
        
        //[2020]솔루션QA현황 문서 RV탭에 복사하기 - 이재현
        var qa_info = new Array();
        qa_info[0] = mng_no;
        qa_info[1] = company_nm;
        qa_info[2] = req_deploy_date;
        qa_info[3] = new Date();;
        qa_info[4] = deploy_type;
        qa_info[5] = mail_send_status;
        
        var qa_sheetActive = SpreadsheetApp.openById('1UK1sSa7e9UqrXfKJgbOHBqej5sPcBraRLnAd7B4quko');
        var qa_sheet = qa_sheetActive.getSheetByName('RC');
        
        var info = new Array();
        info = new Array();
        info.push(qa_info);
        
        qa_sheet.insertRowBefore(3);
        qa_sheet.getRange("A3:F3").setValues(info);
      }
      else
      {
        //배포 경로 입력 필요
        SpreadsheetApp.getActiveSpreadsheet().toast("배포경로가 누락되었습니다. 입력 바랍니다", "배포경로 입력");
        Logger.log("deploy_folder is null");
      }
    }

    //패치 실패는 패치실패 탭으로 이동
    else if( deploy_st == "패치 실패")
    {
      var deploy_folder = "";
      if(deploy_server == "AWS"){
        deploy_folder = "[" + deploy_server + "]" + folder_nm;
      }
      else {
        deploy_folder = "[" + deploy_server + "]" + folder_nm;
      }

      if( deploy_folder != "" )
      {
        Logger.log("[패치 실패]deploy_st : "+deploy_st );
        
        mail_subject = "[RC-" + company_nm + "] " + deploy_st;
        mail_body = makeTemplateFailDeploy(company_nm, toYmd(new Date()), deploy_server, folder_nm, deploy_st, deploy_memo);
        sendEmail(end_deploy_email, mail_subject, mail_body);
        
        //패치실패탭에 복사하기
        var apply_info = new Array();
        apply_info[0] = mng_no;
        apply_info[1] = "=HYPERLINK(\"https://docs.google.com/spreadsheets/d/1NZ3tl8xKlaWU_5duucfL9LqEkae3nVVCn7g-5domRc0/edit#gid="+issue_no_gid+"\","+issue_no+")";
        apply_info[2] = company_nm;
        apply_info[3] = deploy_type;
        apply_info[4] = req_deploy_date;
        apply_info[5] = requester;
        apply_info[6] = deploy_folder;
        apply_info[7] = new Date();
        apply_info[8] = deploy_memo; //패치실패일때 메모 사용~
        apply_info[9] = data[i][15];  //웹 개발 설문 참고사항(숨김 셀)
        apply_info[10] = data[i][16];
        apply_info[11] = data[i][17];
        apply_info[12] = data[i][18];
        apply_info[13] = data[i][19];
        apply_info[14] = data[i][20]; //맥 개발 설문 참고사항(숨김 셀)
        apply_info[15] = mail_send_status; //메일 보낸 상태(직전 상태 저장)를 배포상태로 전달.
        
        deploy_info = new Array();
        deploy_info.push(apply_info);
        var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("패치실패");
        ss.insertRowAfter(4);
        ss.getRange("B5:Q5").setValues(deploy_info);
        
        // 진행중 탭에서 삭제하기
        ss_ing.deleteRow(row_cnt);
        row_cnt--;
        
        //[2020]솔루션QA현황 문서 RV탭에 복사하기 - 이재현
        var qa_info = new Array();
        qa_info[0] = mng_no;
        qa_info[1] = company_nm;
        qa_info[2] = req_deploy_date;
        qa_info[3] = new Date();;
        qa_info[4] = deploy_type;
        qa_info[5] = mail_send_status;
        
        var qa_sheetActive = SpreadsheetApp.openById('1UK1sSa7e9UqrXfKJgbOHBqej5sPcBraRLnAd7B4quko');
        var qa_sheet = qa_sheetActive.getSheetByName('RC');
        
        var info = new Array();
        info = new Array();
        info.push(qa_info);
        
        qa_sheet.insertRowBefore(3);
        qa_sheet.getRange("A3:F3").setValues(info);
      }
      else
      {
        //배포 경로 입력 필요
        SpreadsheetApp.getActiveSpreadsheet().toast("배포경로가 누락되었습니다. 입력 바랍니다", "배포경로 입력");
        Logger.log("deploy_folder is null");
      }
    }
  }
}


function toYmd(org_date) {
  day = new Date(org_date);
  var str_day = "" + day.getFullYear() + "." + padZero((day.getMonth()+1)) + "." + padZero(day.getDate());
  return str_day;
}

function padZero(month_day) {
  if( month_day < 10 ) {
    return "0" + month_day;
  }
  return month_day;
}

function sendEmail(mailTo, subject, message) {

    MailApp.sendEmail(mailTo, subject, "body", {
      htmlBody: message
      ,name: "QA"
      ,cc: g_ccEmail
    });
}

// 개발자 테스트케이스 요청
function makeTemplateReqDevTC(company_nm, req_deploy_date, requester, dev_type, dev_tc) {
  var template = HtmlService.createTemplate(
    "RC 솔루션 개발에 대한 개발자 테스트 요청드립니다.<br>" +
    "<ul>" +
    "<li>업체 : <?=company_nm?><br>" +
    "<li>배포요청일자 : <?=req_deploy_date?><br>" +
    "<li>요청인 : <?=requester?><br>" +
    "<li>배포분야 : <?=dev_type?><br>" +
    "<li>개발자 TestCase : <?=dev_tc?><br>" +
    "<li>참고문서 : https://docs.google.com/spreadsheets/d/10LMJnPaGUm53ors9pSNwMviCWk3UwLns0rgPrXcWjIo/edit#gid=0<br>" +
    "</ul>" +
    "<br>" +
    ""
  );
  template.company_nm = company_nm;
  template.req_deploy_date = req_deploy_date;
  template.requester = requester;
  template.dev_type = dev_type;
  template.dev_tc = dev_tc;
  return template.evaluate().getContent();
}

// 개발자 테스트케이스 생성 및 입력 요청
function makeReqDevTCforQA(company_nm, req_deploy_date, requester, dev_type) {
  var template = HtmlService.createTemplate(
    "RC 솔루션 개발에 대한 개발자 테스트케이스 작성 및 입력 요청드립니다.<br>" +
    "<ul>" +
    "<li>업체 : <?=company_nm?><br>" +
    "<li>배포요청일자 : <?=req_deploy_date?><br>" +
    "<li>요청인 : <?=requester?><br>" +
    "<li>배포분야 : <?=dev_type?><br>" +
    "<li>참고문서 : https://docs.google.com/spreadsheets/d/10LMJnPaGUm53ors9pSNwMviCWk3UwLns0rgPrXcWjIo/edit#gid=0<br>" +
    "</ul>" +
    "<br>" +
    ""
  );
  template.company_nm = company_nm;
  template.req_deploy_date = req_deploy_date;
  template.requester = requester;
  template.dev_type = dev_type;
  return template.evaluate().getContent();
}

// 개발요청 메일템플릿
function makeTemplateReqDev(company_nm, req_deploy_date, requester, dev_type, deploy_server, folder_nm) {
  var template = HtmlService.createTemplate(
    "아래와 같이 RC 솔루션 개발 요청드립니다.<br>" +
    "QA 담당자는 개발자 TestCase 작성 및 링크를 입력해 주세요.<br>" +
    "<ul>" +
    "<li>업체 : <?=company_nm?><br>" +
    "<li>배포요청일자 : <?=req_deploy_date?><br>" +
    "<li>요청인 : <?=requester?><br>" +
    "<li>배포분야 : <?=dev_type?><br>" +
    "<li>배포서버 : [<?=deploy_server?>]<?=folder_nm?><br>" +
    "<li>참고문서 : https://docs.google.com/spreadsheets/d/10LMJnPaGUm53ors9pSNwMviCWk3UwLns0rgPrXcWjIo/edit#gid=0<br>" +
    "</ul>" +
    "<br>" +
    ""
  );
  template.company_nm = company_nm;
  template.req_deploy_date = req_deploy_date;
  template.requester = requester;
  template.dev_type = dev_type;
  template.deploy_server = deploy_server;
  template.folder_nm = folder_nm;
  return template.evaluate().getContent();
}

// 개발완료 메일템플릿
function makeTemplateReqSurvey(mng_no, issue_no, issue_no_gid, company_nm, req_deploy_date, requester, dev_type, deploy_server, folder_nm) {
  var template = HtmlService.createTemplate(
    "개발 완료에 따른 <b><font color=red>설문지 제출</font></b> 부탁드립니다.<br>" +
    "설문지 : https://docs.google.com/forms/d/e/1FAIpQLSdUpae9pCTPgTYdzs3nle277wlEVoXsqziJ8JW90M99M3ln1w/viewform<br><br>" +
    "<ul>" +
    "<li>관리번호 : <b><font color=red><?=mng_no?></font></b><br>" +
    "<li>업체 : [<?=issue_no?>] <?=company_nm?><br>" +
    "<li>배포요청일자 : <?=req_deploy_date?><br>" +
    "<li>요청인 : <?=requester?><br>" +
    "<li>배포분야 : <?=dev_type?><br>" +
    "<li>배포경로 : [<?=deploy_server?>]<b><?=folder_nm?></b><br>" +
    "<li>참고문서 : <a href='https://docs.google.com/spreadsheets/d/10LMJnPaGUm53ors9pSNwMviCWk3UwLns0rgPrXcWjIo/edit#gid=0' target='_blank'>Master 서버 현황</a><br>" +
    "</ul>" +
    "<br>" +
    ""
  );
  template.mng_no = mng_no;
  template.issue_no = issue_no;
  template.company_nm = company_nm;
  template.req_deploy_date = req_deploy_date;
  template.requester = requester;
  template.dev_type = dev_type;
  template.deploy_server = deploy_server;
  template.folder_nm = folder_nm;
  template.issue_no_gid = issue_no_gid;
  return template.evaluate().getContent();
}

//QA 요청 메일 템플릿
function makeTemplateReqQa(company_nm, deploy_date, requester, dev_tc) {
  var template = HtmlService.createTemplate(
    "아래와 같이 RC 솔루션 QA요청 드립니다.<br>" +
    "<ul>" +
    "<li>업체 : <?=company_nm?><br>" +
    "<li>배포일자 : <?=deploy_date?><br>" +
    "<li>요청인 : <?=requester?><br>" +
    "<li>개발자 TestCase : <?=dev_tc?><br>" +
    "<li>참고문서 : https://docs.google.com/spreadsheets/d/10LMJnPaGUm53ors9pSNwMviCWk3UwLns0rgPrXcWjIo/edit#gid=0<br>" +
    "</ul>" +
    "<br>" +
    ""
  );
  template.company_nm = company_nm;
  template.deploy_date = deploy_date;
  template.requester = requester;
  template.dev_tc = dev_tc;
  return template.evaluate().getContent();
}

//QA 완료 (FAIL) 메일 템플릿
function makeTemplateQaResult(mng_no, issue_no, issue_no_gid, company_nm, req_deploy_date, requester, dev_type, deploy_server, folder_nm, deploy_st) {    
  var template = HtmlService.createTemplate(
    "아래 RC 솔루션에 대해 QA 결과입니다. <?=deploy_st?><br><br>" +
    "<font color=red>이슈 수정 후 기존 설문지 작성 내용이 변경되어야 하는 경우 수정바랍니다.</font> <br><br>" +
    "<li>관리번호 : <b><font color=red><?=mng_no?></font></b><br>" +
    "<li>업체 : [<?=issue_no?>] <?=company_nm?><br>" +
    "<li>배포요청일자 : <?=req_deploy_date?><br>" +
    "<li>요청인 : <?=requester?><br>" +
    "<li>배포분야 : <?=dev_type?><br>" +
    "<li>배포경로 : [<?=deploy_server?>]<b><?=folder_nm?></b><br>" +
    "<li>참고문서 : <a href='https://docs.google.com/spreadsheets/d/10LMJnPaGUm53ors9pSNwMviCWk3UwLns0rgPrXcWjIo/edit#gid=0' target='_blank'>Master 서버 현황</a><br>" +
    "</ul>" +
    "<br>" +
    "" 
  );
  template.deploy_st = deploy_st;
  template.mng_no = mng_no;
  template.issue_no = issue_no;
  template.company_nm = company_nm;
  template.req_deploy_date = req_deploy_date;
  template.requester = requester;
  template.dev_type = dev_type;
  template.deploy_server = deploy_server;
  template.folder_nm = folder_nm;
  template.issue_no_gid = issue_no_gid;
  return template.evaluate().getContent();
}

//배포 완료메일 템플릿
function makeTemplateDeployResult(mng_no, issue_no, issue_no_gid, company_nm, req_deploy_date, requester, dev_type, deploy_server, folder_nm, deploy_st, surveyresult) {    
  var template = HtmlService.createTemplate(
    "아래 RC 솔루션에 대해 배포 결과입니다. <?=deploy_st?><br><br>" +
    //"<font color=red>이슈 수정 후 기존 설문지 작성 내용이 변경되어야 하는 경우 수정바랍니다.</font> <br><br>" +
    "<li>관리번호 : <b><font color=red><?=mng_no?></font></b><br>" +
    "<li>업체 : [<?=issue_no?>] <?=company_nm?><br>" +
    "<li>배포요청일자 : <?=req_deploy_date?><br>" +
    "<li>요청인 : <?=requester?><br>" +
    "<li>배포분야 : <?=dev_type?><br>" +
    "<li>배포경로 : [<?=deploy_server?>] <b><?=folder_nm?></b><br>" +
    "<li>참고문서 : <a href='https://docs.google.com/spreadsheets/d/10LMJnPaGUm53ors9pSNwMviCWk3UwLns0rgPrXcWjIo/edit#gid=0' target='_blank'>Master 서버 현황</a><br>" +
    "<li>설문내용 : " + surveyresult + "<br>" +
    "</ul>" +
    "<br>" +
    "" 
  );
  template.deploy_st = deploy_st;
  template.mng_no = mng_no;
  template.issue_no = issue_no;
  template.company_nm = company_nm;
  template.req_deploy_date = req_deploy_date;
  template.requester = requester;
  template.dev_type = dev_type;
  template.deploy_server = deploy_server;
  template.folder_nm = folder_nm;
  template.issue_no_gid = issue_no_gid;
 
  return template.evaluate().getContent();
}

// 패치완료 메일템플릿
function makeTemplateEndDeploy(company_nm, deploy_date, deploy_server, folder_nm, deploy_status) {
  var template = HtmlService.createTemplate(
    "아래와 같이 RC 솔루션 배포 서버에 패치완료되었습니다.<br>" +
    "<ul>" +
    "<li>업체 : <?=company_nm?><br>" +
    "<li>패치완료일자 : <?=deploy_date?><br>" +
    "<li>배포경로 : [<?=deploy_server?>] <b><?=folder_nm?></b><br>" +
    "<li>참고문서 : https://docs.google.com/spreadsheets/d/10LMJnPaGUm53ors9pSNwMviCWk3UwLns0rgPrXcWjIo/edit#gid=0<br>" +
    "</ul>" +
    "<br>" +
    ""
  );
  template.company_nm = company_nm;
  template.deploy_date = deploy_date;
  template.deploy_server = deploy_server;
  template.folder_nm = folder_nm;
  template.deploy_status = deploy_status;
  return template.evaluate().getContent();
}

// 패치실패 메일템플릿
function makeTemplateFailDeploy(company_nm, deploy_date, deploy_server, folder_nm, deploy_status, deploy_memo) {
  var template = HtmlService.createTemplate(
    "아래 RC 솔루션이 패치 실패되었습니다.<br>" +
    "패치실패 내용 수정이 필요할 경우 솔루션 배포시트 패치실패 탭에서 수정바랍니다.<br>" +
    "<ul>" +
    "<li>업체 : <?=company_nm?><br>" +
    "<li>패치일자 : <?=deploy_date?><br>" +
    "<li>배포경로 : [<?=deploy_server?>] <b><?=folder_nm?></b><br>" +
    "<li>사유 : <?=deploy_memo?><br>" +
    "<li>참고문서 : https://docs.google.com/spreadsheets/d/10LMJnPaGUm53ors9pSNwMviCWk3UwLns0rgPrXcWjIo/edit#gid=0<br>" +
    "</ul>" +
    "<br>" +
    ""
  );
  template.company_nm = company_nm;
  template.deploy_date = deploy_date;
  template.deploy_server = deploy_server;
  template.folder_nm = folder_nm;
  template.deploy_memo = deploy_memo;
  template.deploy_status = deploy_status;
  return template.evaluate().getContent();
}

// 배포완료 상태 확인 메일 전송
function sendMailCheckDeployStatus(){
  Logger.log("sendMailCheckDeployStatus started");

  var remind_email = SpreadsheetApp.getActive().getSheetByName("CODE").getRange("B18").getValue();
  var cc_email = SpreadsheetApp.getActive().getSheetByName("CODE").getRange("B19").getValue();
  //var remind_email = "sinhyekim@rsupport.com";

  // 진행중탭
  var ss_ing = SpreadsheetApp.getActive().getSheetByName("진행중");
  var range = ss_ing.getRange("B4:AB");
  var data = range.getValues();

  var deploy_st,issue_no, company_nm, req_deploy_date, requester, mail_subject, mail_body;
  var deploy_list = "";
  for(var i = 0; i < data.length; i++) {

    //납품번호 비어있으면 loop종료
    if( data[i][5] == "" )  break;

    // Fetch
    issue_no = data[i][5];  //이슈번호
    company_nm = data[i][6];
    
    req_deploy_date = data[i][8];
    requester = data[i][9];
    
    deploy_st = data[i][14];  //배포 상태
   
    //importrange error로 인해 업체명 #N/A 표시하면 건너뛰기
    if( company_nm == "#N/A")  break;

    if(deploy_st == "배포 완료 (PASS)" || deploy_st == "배포 완료 (FAIL)" || deploy_st == "배포 완료 (NQ)"){
      var cellNo = "H" + (i+4);
      var company_link = ss_ing.getRange(cellNo).getRichTextValue().getLinkUrl();

      var companyInfo;
      if(company_link != null){
        companyInfo = "<li>[" + issue_no +"]" + "요청인:" + requester + " | <a href='" + company_link + "' target='_blank'>" + company_nm +"</a>"  + " | 배포요청일자:" + toYmd(req_deploy_date) + " | 배포상태:" + deploy_st;
      } else {
        companyInfo = "<li>[" + issue_no +"]" + "요청인:" + requester  + " | " + company_nm  + " | 배포요청일자:" + toYmd(req_deploy_date) + " | 배포상태:" + deploy_st;
      }
      
      deploy_list += companyInfo;
      
    }
  }

  if(deploy_list != null && deploy_list !=""){
    //Logger.log("deploy_list" + ": " + deploy_list);
    mail_subject = "[RC] 배포완료 확인 정기메일";
    mail_body = makeTemplateDelay(deploy_list);
    //sendEmail(remind_email, mail_subject, mail_body);

    MailApp.sendEmail(remind_email, mail_subject, "body", {
      htmlBody: mail_body
      ,name: "QA"
      ,cc: cc_email
    });
  }
}

// 배포완료 확인메일
function makeTemplateDelay(deploy_list) {
  var template = HtmlService.createTemplate(
    "배포완료 된 솔루션 내역을 확인해주세요. <br>" +
    "<ul>" +
    deploy_list + 
    "</ul><br>" +
    "<b>자세한 내용은 <a href='https://docs.google.com/spreadsheets/d/10LMJnPaGUm53ors9pSNwMviCWk3UwLns0rgPrXcWjIo/edit#gid=0' target='_blank'>RC솔루션 배포현황 시트</a>를 확인해주세요.</b><br>" + 
    "<br><br>" +

    "<i>*이 메일은 매주 월요일 자동 전송됩니다.</i>" + 
    "<br>" +
    ""
  );
  
  return template.evaluate().getContent();
}

