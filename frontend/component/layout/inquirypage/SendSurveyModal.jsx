
import { useSurvey } from 'frontend/context/Survey/SurveyContext';
import { useEffect } from 'react';

const SendSurveyModal = ({ modalRef, ticketId }) => {

  const { surveyLinks, fetchSurveyLinks } = useSurvey();


  useEffect(() => {
    fetchSurveyLinks();
  }, []);

  return (
    <dialog
      id="SendSurvey"
      className="modal w-[557px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
      ref={modalRef}
    >
      <div className="">
        <form
          method="dialog"
          className="pt-1 flex justify-end"
        >
          <button className="absolute justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA text-custom-bluegreen hover:bg-custombg"  >
            ✕
          </button>
        </form>
      </div>
      <div className="p-[25px] rounded-lg">
        <div className='flex flex-col gap-[10px] items-center '>
          {/* Survey Links */}
          {surveyLinks
            .filter(item => item.surveyName !== "N/A")
            .map((item, index) => {
              const id = ticketId.replace("Ticket#", "").trim();
              const fullLink = `${item.surveyLink}/${id}/manual`;

              return (
                <div key={index}>
                  <a
                    href={fullLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      modalRef.current?.close();
                    }}
                    className="h-[37px] min-w-[320px] gradient-btn rounded-[10px] text-white text-sm flex items-center justify-center"
                  >
                    {item.surveyName}
                  </a>
                </div>
              );
            })}
        </div>
      </div>
    </dialog>
  )
}

export default SendSurveyModal