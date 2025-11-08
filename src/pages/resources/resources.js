import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./resources.css";
import Header from "../../components/header/header";
import Loader from "../../components/loader/loader";
import { usePageTracking } from "../../hooks/usePageTracking";
import {
  getAllResources,
  getResourcesByTopic,
  deleteResource,
  clearAllResources,
  getResourceStats,
  saveLearningActivity,
} from "../../utils/indexedDB";
import { Trash2, Database, FolderOpen } from "lucide-react";
import Markdown from "react-markdown";

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [filterTopic, setFilterTopic] = useState("all");
  const navigate = useNavigate();

  // 📊 TRACKING: Theo dõi thời gian xem từng tài liệu
  const resourceTracking = usePageTracking(
    selectedResource?.topic || 'Resources',
    selectedResource?.subtopic || 'Danh sách tài nguyên',
    'view_resource',
    30000, // Auto-save mỗi 30 giây
    3 // Tối thiểu 3 giây
  );

  useEffect(() => {
    loadResources();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTopic]);

  const loadResources = async () => {
    try {
      setLoading(true);
      let data;
      if (filterTopic === "all") {
        data = await getAllResources();
      } else {
        data = await getResourcesByTopic(filterTopic);
      }
      setResources(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải resources:", error);
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      await getResourceStats();
    } catch (error) {
      console.error("Lỗi khi tải thống kê:", error);
    }
  };

  const handleDelete = async (topic, subtopic) => {
    if (window.confirm("Bạn có chắc muốn xóa tài nguyên này?")) {
      try {
        await deleteResource(topic, subtopic);
        loadResources();
        loadStats();
        setSelectedResource(null);
        alert("Đã xóa tài nguyên");
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
        alert("Lỗi khi xóa tài nguyên");
      }
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        "⚠️ CẢNH BÁO: Bạn có chắc muốn xóa TẤT CẢ tài nguyên đã lưu? Hành động này không thể hoàn tác!"
      )
    ) {
      try {
        await clearAllResources();
        loadResources();
        loadStats();
        setSelectedResource(null);
        alert("Đã xóa tất cả tài nguyên");
      } catch (error) {
        console.error("Lỗi khi xóa tất cả:", error);
        alert("Lỗi khi xóa tất cả tài nguyên");
      }
    }
  };

  const uniqueTopics = [...new Set(resources.map((r) => r.topic))];

  return (
    <div className="resources-page">
      <Header />
      <Loader style={{ display: loading ? "block" : "none" }}>
        Đang tải tài nguyên...
      </Loader>

      <div className="resources-container">
        <div className="resources-sidebar">
          <div className="sidebar-header">
            <Database size={30} />
            <h2>Tài nguyên đã lưu</h2>
          </div>

          {/* {stats && (
            <div className="stats-card">
              <div className="stat-item">
                <TrendingUp size={20} />
                <div>
                  <p className="stat-label">Tổng số tài nguyên</p>
                  <p className="stat-value">{stats.totalResources}</p>
                </div>
              </div>
              <div className="stat-item">
                <FolderOpen size={20} />
                <div>
                  <p className="stat-label">Số chủ đề</p>
                  <p className="stat-value">
                    {Object.keys(stats.resourcesByTopic).length}
                  </p>
                </div>
              </div>
            </div>
          )} */}

          <div className="filter-section">
            <label>Lọc theo chủ đề:</label>
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="topic-filter"
            >
              <option value="all">Tất cả ({resources.length})</option>
              {uniqueTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic} (
                  {resources.filter((r) => r.topic === topic).length})
                </option>
              ))}
            </select>
          </div>

          <div className="resources-list">
            {resources.length === 0 ? (
              <div className="empty-state">
                <Database size={60} strokeWidth={1} />
                <p>Chưa có tài nguyên nào được lưu</p>
                <button onClick={() => navigate("/")}>Bắt đầu học</button>
              </div>
            ) : (
              resources.map((resource, index) => (
                <div
                  key={index}
                  className={`resource-item ${
                    selectedResource?.id === resource.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedResource(resource)}
                >
                  <div className="resource-item-header">
                    <h3>{resource.subtopic}</h3>
                    <button
                      className="delete-btn-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(resource.topic, resource.subtopic);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="resource-topic">{resource.topic}</p>
                  <p className="resource-time">
                    {new Date(resource.timestamp).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              ))
            )}
          </div>

          {resources.length > 0 && (
            <button className="clear-all-btn" onClick={handleClearAll}>
              <Trash2 size={20} />
              Xóa tất cả
            </button>
          )}
        </div>

        <div className="resources-content">
          {selectedResource ? (
            <div className="resource-detail">
              <div className="resource-detail-header">
                <div>
                  <h1>{selectedResource.subtopic}</h1>
                  <p className="resource-meta">
                    <span className="topic-badge">
                      {selectedResource.topic}
                    </span>
                    <span className="time-badge">
                      ⏱️ {selectedResource.time}
                    </span>
                    <span className="level-badge">
                      📊 {selectedResource.knowledge_level}
                    </span>
                  </p>
                  <p className="resource-description">
                    {selectedResource.description}
                  </p>
                  <p className="saved-date">
                    💾 Đã lưu:{" "}
                    {new Date(selectedResource.timestamp).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(
                      selectedResource.topic,
                      selectedResource.subtopic
                    )
                  }
                >
                  <Trash2 size={24} />
                  Xóa
                </button>
              </div>

              <div className="resource-content-body">
                <Markdown>{selectedResource.content}</Markdown>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <FolderOpen size={100} strokeWidth={1} />
              <h2>Chọn một tài nguyên để xem</h2>
              <p>Chọn một tài nguyên từ danh sách bên trái</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
