import { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TableContainer,
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Checkbox,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";

export default function MainPage() {
  const [dbInfo, setDbInfo] = useState({ name: "no database", tables: [] });
  const [selectedTable, setSelectedTable] = useState("");
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [customQuery, setCustomQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [newRecord, setNewRecord] = useState({});
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);

  const BASE_PATH = "https://db-manager-9jaj.onrender.com";

  const tableChange = (event) => {
    setSelectedTable(event.target.value);
  };

  function generateColumnsFromData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const keys = Object.keys(data[0]);

    const columns = keys.map((key) => {
      return {
        field: key,
        headerName: key.charAt(0).toUpperCase() + key.slice(1),
        width: 130,
      };
    });
    return columns;
  }

  const showingTable = async () => {
    if (selectedTable === "") {
      return;
    }
    try {
      const response = await axios.get(`${BASE_PATH}/db-manipulator/${selectedTable}`);
      setTableData(response.data);
      setColumns(generateColumnsFromData(response.data));
    } catch (error) {
      console.error(error);
    }
    setShowTable(true);
  };

  const handleCustomQueryChange = (event) => {
    setCustomQuery(event.target.value);
  };

  const executeCustomQuery = async () => {
    try {
      const response = await axios.patch(`${BASE_PATH}/db-manipulator/query`, {
        query: customQuery,
      });

      setQueryResult(response.data[0]);
    } catch (error) {
      setQueryResult({ error: `[Sequelize]: ${error.response?.data?.error || 'An error occurred while executing the query.'}` });
    } finally {
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleCheckboxChange = (event, id) => {
    if (event.target.checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    }
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0) {
      return;
    }

    try {
      setIsDeleting(true);

      await axios.delete(`${BASE_PATH}/db-manipulator/delete/content`, {
        data: { table: selectedTable, items: selectedItems },
      });

      await showingTable();

      setIsDeleting(false);
      setSelectedItems([]);
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    }
  };

  const handleEditRow = (rowId) => {
    setEditingRowId(rowId);
  };

  const handleUpdateRow = async (rowData) => {
    try {
      await axios.put(`${BASE_PATH}/db-manipulator/update/content`, {
        table: selectedTable,
        data: rowData,
      });

      await showingTable();
      setEditingRowId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddRecord = async () => {
    try {
      const newRecordData = {
        table: selectedTable,
        data: newRecord,
      };
  
      await axios.post(`${BASE_PATH}/db-manipulator/insert/content`, newRecordData);
      setNewRecord({});
      showingTable();
      setAddRecordOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_PATH}/db-manipulator/database-info`);
        setDbInfo(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ backgroundColor: "transparent", width: "65%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5em" }}>
        <Typography variant="h3">{dbInfo.name}</Typography>
        <FormControl sx={{ width: "30%" }}>
          <InputLabel id="db-select-label">Table</InputLabel>
          <Select labelId="db-select-label" id="db-select" value={selectedTable || ""} label="Table" onChange={tableChange}>
            {dbInfo.tables.map((element) => (
              <MenuItem value={element} key={element}>
                {element}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button onClick={() => showingTable()} variant="contained">
          Show table content
        </Button>
        {showTable ? (
          <div>
            <Button onClick={() => setAddRecordOpen(true)} variant="contained" color="primary">
              Add Record
            </Button>
            <TableContainer style={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Checkbox
                        onChange={(event) => {
                          if (event.target.checked) {
                            setSelectedItems(tableData.map((item) => item.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                      />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.field}>{column.headerName}</TableCell>
                    ))}
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Checkbox checked={selectedItems.includes(row.id)} onChange={(event) => handleCheckboxChange(event, row.id)} />
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell key={column.field}>
                          {editingRowId === row.id ? (
                            <TextField
                              fullWidth
                              value={row[column.field]}
                              onChange={(event) => {
                                const updatedData = [...tableData];
                                const rowIndex = updatedData.findIndex((item) => item.id === row.id);
                                updatedData[rowIndex][column.field] = event.target.value;
                                setTableData(updatedData);
                              }}
                            />
                          ) : (
                            row[column.field]
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        {editingRowId === row.id ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleUpdateRow(row)}
                          >
                            Update
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleEditRow(row.id)}
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box mt={2}>
              <Button
                onClick={() => handleDelete()}
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                disabled={isDeleting || selectedItems.length === 0}
              >
                {isDeleting ? "Deleting..." : "Delete Selected"}
              </Button>
            </Box>
          </div>
        ) : null}
        <TextField
          sx={{ width: '30%' }}
          onChange={handleCustomQueryChange}
          label="Custom query"
          variant="outlined"
          fullWidth
        />
        <Button
          onClick={() => executeCustomQuery()}
          variant="contained"
          color="secondary"
          disabled={customQuery.length <= 0}
        >
          Execute
        </Button>
        <span style={{ color: 'black' }}>Remember to always type the table name in double quotes</span>
      </Box>

      {/* Record Dialog */}
      <Dialog open={addRecordOpen} onClose={() => setAddRecordOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Add New Record</DialogTitle>
        <DialogContent>
          <form>
            {columns.map((column) => {
              if (column.field !== "updatedAt" && column.field !== "createdAt" && column.field !== "id") {
                return (
                  <TextField
                    key={column.field}
                    margin="dense"
                    label={column.headerName}
                    fullWidth
                    value={newRecord[column.field] || ""}
                    onChange={(e) => setNewRecord({ ...newRecord, [column.field]: e.target.value })}
                  />
                );
              } else {
                return (
                  <TextField
                    key={column.field}
                    margin="dense"
                    label={column.headerName}
                    fullWidth
                    value={newRecord[column.field] || ""}
                    disabled
                  />
                );
              }
            })}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddRecordOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleAddRecord()} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Query Result Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="lg">
        <DialogTitle>Query Result</DialogTitle>
        <DialogContent>
          {queryResult?.error ? (
            <Typography color="error">{queryResult.error}</Typography>
          ) : Array.isArray(queryResult) ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {queryResult[0] &&
                      Object.keys(queryResult[0]).map((column) => (
                        <TableCell key={column}>{column}</TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {queryResult.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Object.keys(row).map((column, columnIndex) => (
                        <TableCell key={columnIndex}>{row[column]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
